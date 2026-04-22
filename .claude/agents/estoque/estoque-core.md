---
name: estoque-core
description: Estrutura do módulo de estoque
model: claude-haiku-4-5-20251001
tools: []
triggers: [estoque, insumos, movimentacao, categorias_insumos]
---

# Escopo

app/estoque/page.tsx
app/estoque/insumos/page.tsx
app/estoque/movimentar/page.tsx
app/estoque/categorias/page.tsx

# Banco

categorias_insumos
insumos
movimentacoes_estoque

# Regras

- Não permitir saldo negativo
- Movimentação deve registrar usuario_id
- Categoria não pode ser excluída com insumos vinculados
- Insumo não pode ser excluído com movimentações

# NÃO TOCAR

auth
organizacional
layout
vendas