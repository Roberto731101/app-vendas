# Protocolo do Projeto - SIG

## Objetivo
Garantir organização, coerência e evolução estruturada do sistema, evitando retrabalho e acúmulo de erros.

---

## 1. Regra Geral

Nenhuma funcionalidade deve ser implementada sem:

- definição de objetivo
- análise de impacto na estrutura
- atualização da documentação

---

## 2. Classificação de Funcionalidades

Toda funcionalidade deve ser classificada em uma das áreas:

- Administrativa / Financeira
- Operacional
- Técnica

---

## 3. Antes de Iniciar uma Funcionalidade

Definir:

- Objetivo da funcionalidade
- Área do sistema (SIG)
- Telas envolvidas
- Tabelas impactadas
- Regras de negócio novas ou alteradas

Atualizar se necessário:

- docs/projeto.md
- docs/backlog.md
- docs/fluxo-telas.md

---

## 4. Durante a Implementação

Seguir as regras:

- evitar lógica grande em page.tsx
- criar componentes reutilizáveis
- separar regra de negócio (lib/)
- usar tipagem (types/)
- evitar duplicação de código

---

## 5. Ao Finalizar a Funcionalidade

Revisar:

- estrutura de pastas
- organização do código
- tipagem
- duplicações

Atualizar:

- docs/regras-negocio.md
- docs/fluxo-telas.md
- docs/backlog.md

Se necessário:

- docs/estrutura-banco.md
- docs/integracao-powerbi.md

---

## 6. Uso das Ferramentas de IA

### ChatGPT
- decisões de arquitetura
- revisão de estrutura
- organização do projeto
- definição de próximos passos

### Claude
- geração de código
- refatoração
- criação de componentes
- revisão rápida de arquivos

---

## 7. Regra de Uso

Antes de gerar código com IA:

- validar objetivo
- validar local no projeto
- validar impacto na arquitetura

---

## 8. Revisão Periódica

Realizar revisão quando:

- finalizar um módulo
- iniciar nova área do SIG
- perceber crescimento desorganizado

---

## 9. Crescimento do Sistema

Evoluir por áreas:

- Administrativa
- Operacional
- Técnica

Evitar antecipar complexidade.

---

## 10. Ritual de Trabalho

### Início

Funcionalidade:
Área:
Objetivo:
Telas:
Tabelas:
Documentos impactados:

### Encerramento

Funcionalidade concluída:
Arquivos criados:
Alterações realizadas:
Documentos atualizados:
Riscos identificados:
Próximo passo: