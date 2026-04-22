# Guia de Uso dos Agentes

## Ordem de uso

1. `execution-pattern`
2. `orchestrator`
3. agente de domínio
4. agente de tarefa, se existir

## Regra principal

Nunca começar executando direto.

Sempre seguir:
- Ler
- Diagnosticar
- Planejar
- Executar
- Validar
- Retornar

## Exemplos

### Exemplo 1 — módulo organizacional
Se a tarefa envolver:
- usuarios
- departamentos
- cargos
- funcoes

Usar:
1. `orchestrator`
2. `org-core`
3. `org-permissoes` ou `org-crud`

### Exemplo 2 — autenticação
Se envolver:
- login
- logout
- sessão
- permissões
- proxy

Usar:
1. `orchestrator`
2. `auth-core`

### Exemplo 3 — layout
Se envolver:
- sidebar
- menu
- nav
- header

Usar:
1. `orchestrator`
2. `layout-core`

### Exemplo 4 — estoque
Se a tarefa envolver:
- insumos
- categorias de insumos
- movimentações
- saldo

Usar:
1. `orchestrator`
2. `estoque-core`
3. `estoque-movimentacao` ou `estoque-cadastros`

## Regra de segurança

Se o agente não for o dono do arquivo, não deve alterar.

## Objetivo

- reduzir token
- evitar contaminação entre módulos
- aumentar previsibilidade
- aumentar qualidade da execução