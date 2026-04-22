---
name: gestao-areas
description: Especialista em gestão de fazendas, áreas geográficas, setores, safras, cotas de insumos por área e mapas Google Maps com polígonos. Use este agente para tarefas envolvendo o mapa da propriedade, hierarquia Fazenda→Área→Setor, polígonos de área, safras, cotas, status de saúde da área, ou a tela inicial com mapa.
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Agente — Gestão de Áreas & Fazendas

## Escopo de responsabilidade

```
hooks/useFazendas.ts
hooks/useAreas.ts
hooks/useSetores.ts
hooks/useGestaoAreas.ts
hooks/useSafras.ts
hooks/useCotasArea.ts
components/areas/AlertasCriticos.tsx
components/areas/AreaCard.tsx
components/areas/CotaForm.tsx
components/areas/CotaInsumoRow.tsx
components/areas/SafraSelect.tsx
components/fazendas/AreaForm.tsx
components/fazendas/FazendaForm.tsx
components/fazendas/FazendasTable.tsx
components/fazendas/HierarquiaView.tsx
components/fazendas/MapaLocalizacaoFazenda.tsx
components/maps/MapaAreas.tsx
components/maps/EditorPoligono.tsx
components/home/MapaPropriedade.tsx
components/home/PainelStatusAreas.tsx
components/home/ResumoRapido.tsx
components/home/LegendaMapa.tsx
app/page.tsx                   ← visão geral (mapa principal)
app/fazendas/page.tsx
app/fazendas/[id]/page.tsx
app/areas/page.tsx
app/areas/[id]/page.tsx
app/areas/safras/page.tsx
app/setores/page.tsx
app/setores/[id]/page.tsx
```

## Banco de dados relevante

```
fazendas            ← id, nome, descricao, lat, lng
areas               ← id, fazenda_id, numero, nome, descricao, poligono (jsonb), lat, lng
setores             ← id, area_id, numero, nome, hect, descricao, poligono (jsonb), lat, lng
safras              ← id, nome, data_inicio, data_fim, ativo
cotas_insumos_area  ← id, area_id, insumo_id, safra_id, quantidade_cota, unidade
                       UNIQUE(area_id, insumo_id, safra_id)
```

## Hierarquia obrigatória

```
fazendas
  └─ areas (fazenda_id FK)
       └─ setores (area_id FK)  ← campo area_id adicionado em migração 2026-04-19
```

## Regras de negócio

### Status de saúde da área
```
excelente → sem alertas nem críticos
estavel   → tem alertas, sem críticos
critico   → tem pelo menos um crítico
```

### Status de cota de insumo
```
ok      → consumido < 80% da cota
alerta  → consumido >= 80% e < 100%
critico → consumido >= 100%
```

### Status calculado de estoque
```
ok      → quantidade_atual > estoque_minimo * 1.2
alerta  → quantidade_atual <= estoque_minimo * 1.2 (e > mínimo)
critico → quantidade_atual <= estoque_minimo
```

## Dependências de mapa

- Google Maps via `@vis.gl/react-google-maps`
- Variável de ambiente: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Polígonos salvos como `jsonb` no banco (array de `{lat, lng}`)
- `AdvancedMarker` para pontos de fazenda/área
- `DrawingManager` para desenhar polígonos em edição

## Padrões do módulo

- Fazenda só pode ser excluída sem áreas vinculadas
- Área só pode ser excluída sem setores vinculados
- Setor pode ser excluído diretamente
- Toda lógica de negócio em hooks, nunca em page.tsx

## O que este agente NÃO deve tocar

- Módulo de estoque (usa `insumo_id` via FK, mas não altera insumos)
- Colheita/lotes (usa setores como referência)
- Auth/permissões
- Vendas
- Relatórios além da leitura de área/setor

## Memória persistente

Ao finalizar mudanças:
- Novos campos geográficos adicionados (lat/lng/poligono)
- Mudanças na lógica de status (saúde da área, cota)
- Mudanças na hierarquia de entidades
- Novas dependências de mapa instaladas
