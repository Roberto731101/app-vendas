# Fluxo Operacional de Uso dos Agentes

## Objetivo

Padronizar como usar a estrutura de agentes no dia a dia, com:
- menos token
- menos retrabalho
- mais previsibilidade
- mais segurança nas alterações

---

## Fluxo padrão

### 1. Classificar a tarefa
Perguntar:
- é auth?
- é organizacional?
- é layout?
- é outro domínio?

### 2. Escolher o agente
Sempre começar com:
- `orchestrator`

Se a tarefa já estiver clara, ir direto ao agente do domínio.

### 3. Aplicar execution-pattern
Toda tarefa deve seguir:
1. Ler
2. Diagnosticar
3. Planejar
4. Executar
5. Validar
6. Retornar

### 4. Só depois alterar código
Nunca começar mudando código antes do diagnóstico.

---

## Quando usar o auditor

Usar `auditor` quando:
- houver comportamento inconsistente
- houver suspeita de conflito entre front e banco
- houver mistura de domínio
- houver dúvida sobre permissões
- algo “parece certo” mas continua falhando

O `auditor` não corrige.
Ele:
- lê
- compara
- aponta
- classifica
- propõe plano

---

## Quando usar execução em lote

Usar execução em lote quando:
- o padrão da correção já estiver claro
- múltiplos módulos tiverem o mesmo problema
- o objetivo for padronizar comportamento
- quiser economizar token

Exemplo:
- aplicar podeCriar/podeEditar em usuários, departamentos, cargos e funções

---

## Quando usar passo a passo

Usar passo a passo quando:
- a mudança for crítica
- envolver banco
- envolver RLS
- houver risco alto de quebrar algo
- a lógica ainda não estiver clara

---

## Regra de ouro

### Diagnóstico antes de alteração
Sempre.

### Agente certo para o arquivo certo
Sempre.

### Não misturar módulo funcional com módulo administrativo
Sempre.

---

## Exemplo prático

### Caso 1 — bug em permissões
1. chamar `auditor`
2. revisar conflito
3. chamar `orchestrator`
4. delegar para `org-permissoes`
5. executar em lote
6. validar

### Caso 2 — novo CRUD administrativo
1. chamar `orchestrator`
2. usar `org-core`
3. usar `org-crud`
4. validar
5. registrar na memória

### Caso 3 — problema no menu
1. chamar `orchestrator`
2. usar `layout-core`
3. validar módulos do nav
4. testar

---

## Objetivo final

Transformar o uso do Claude em um processo:
- previsível
- econômico
- auditável
- repetível