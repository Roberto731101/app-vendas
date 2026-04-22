---
name: estoque-movimentacao
description: Movimentação de estoque
model: claude-sonnet-4-6
tools: []
triggers: [entrada, saida, movimentacao_estoque, saldo]
---

# Responsabilidade

- Entradas
- Saídas
- Histórico de movimentações
- Validação de saldo

# Regras obrigatórias

- Nunca permitir saldo negativo
- Sempre registrar usuario_id
- Sempre manter localização em cascata:
  fazenda → área → setor

# Banco

movimentacoes_estoque
insumos
categorias_insumos

# NÃO TOCAR

auth
organizacional
layout
vendas