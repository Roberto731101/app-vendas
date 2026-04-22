# Estrutura Refinada de Agentes

## Objetivo

Esta estrutura existe para:

- reduzir consumo de token
- separar domínios com clareza
- impedir que um agente altere arquivos fora do seu escopo
- criar previsibilidade de execução
- permitir execução em lote com menor retrabalho

---

## Estrutura de pastas

```text
.claude/
  agents/
    core/
      execution-pattern.md
      orchestrator.md
    auth/
      auth-core.md
    organizacional/
      org-core.md
      org-permissoes.md
      org-crud.md
    layout/
      layout-core.md
    estoque/
      estoque-core.md
      estoque-movimentacao.md
      estoque-cadastros.md

docs/
  agentes/
    agentes-guia.md
    agentes-estrutura-refinada.md
```

---

## Quando usar cada agente

### estoque-core
Quando a tarefa envolver:
- estoque
- insumos
- categorias
- movimentações

### estoque-movimentacao
Quando a tarefa envolver:
- entrada
- saída
- saldo
- histórico de movimentação

### estoque-cadastros
Quando a tarefa envolver:
- CRUD de insumos
- CRUD de categorias
- listagem de cadastros de estoque