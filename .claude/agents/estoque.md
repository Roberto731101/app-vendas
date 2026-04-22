---
name: estoque
description: Especialista no módulo de estoque — insumos, categorias, movimentações (entrada/saída), saldo e alertas de nível crítico. Use este agente para tarefas envolvendo cadastro de insumos, categorias de insumos, movimentação de estoque, validação de saldo negativo, ou o painel de estoque.
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Agente — Estoque

## Escopo de responsabilidade

```
hooks/useCategorias.ts
hooks/useInsumos.ts
hooks/useMovimentacoes.ts
components/estoque/AlertaCritico.tsx
components/estoque/CategoriaPill.tsx
components/estoque/EstoqueResumoCards.tsx
components/estoque/InsumoCard.tsx
components/estoque/InsumoTable.tsx
components/estoque/MovimentacaoForm.tsx
components/estoque/MovimentacaoHistorico.tsx
components/estoque/StatusBadge.tsx
app/estoque/page.tsx
app/estoque/insumos/page.tsx
app/estoque/movimentar/page.tsx
app/estoque/categorias/page.tsx
```

## Banco de dados relevante

```
categorias_insumos   ← id, nome_categoria, descricao, tipo, ativo
                       tipo: fertilizante | defensivo | semente | outros

insumos              ← id, nome_insumo, categoria_id, marca_fornecedor, unidade,
                       quantidade_atual, estoque_minimo, lote, data_validade,
                       status_estoque (calculado), ativo
                       unidade: kg | L | un | cx | sc | t

movimentacoes_estoque ← id, insumo_id, tipo_movimentacao (entrada|saida),
                         quantidade, unidade, data_movimentacao,
                         fazenda_id, area_id, setor_id,
                         usuario_id (FK → auth.users.id), observacao
```

## Regras de negócio obrigatórias

```
Status calculado de insumo:
  ok      → quantidade_atual > estoque_minimo * 1.2
  alerta  → quantidade_atual <= estoque_minimo * 1.2 (e > mínimo)
  critico → quantidade_atual <= estoque_minimo

Saída não pode deixar saldo negativo → validar antes de persistir

Exclusão bloqueada:
  categoria → se tiver insumos vinculados
  insumo    → se tiver movimentações registradas

Movimentação:
  - usuario_id injetado automaticamente (via auth.users.id do usuário logado)
  - Localização em cascata: Fazenda → Área → Setor (selects dependentes)
```

## Padrões visuais do módulo

```
Fundo:           bg-[#f8f9fa]
Botão primário:  bg-[#1a3a2a] text-white (verde escuro — diferente do padrão global)
Badges categoria: rounded-full, cores por tipo
  fertilizante → verde
  defensivo    → laranja
  semente      → azul
  outros       → cinza
Status: ponto colorido + texto + ícone ▲ para crítico
Números de quantidade: text-3xl font-black
```

## O que este agente NÃO deve tocar

- Módulo de gestão de áreas (usa fazenda/área/setor apenas como referência de localização)
- Auth/permissões além do uso atual nas pages
- Vendas, colheita, relatórios
- Cadastros base (produtos, classificações, tipos-caixa) — são domínios separados

## Memória persistente

Ao finalizar mudanças:
- Mudanças no algoritmo de status_estoque
- Novas validações de movimentação
- Novos tipos de unidade ou categoria
- Mudanças na injeção automática de usuario_id
