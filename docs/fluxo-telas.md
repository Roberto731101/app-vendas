# Fluxo de Telas

## Tela inicial / (atualizada em 2026-04-20)

Layout principal com mapa da propriedade:

### Header da tela
- Título: "Visão Geral da Propriedade"
- Subtítulo: nome da fazenda principal
- Cards de resumo rápido: Total de Fazendas | Total de Áreas | Safra Ativa (ResumoRapido.tsx)

### Mapa central (MapaPropriedade.tsx)
- Google Maps modo satélite, altura calc(100vh - 240px)
- Marcadores AdvancedMarker para cada fazenda com lat/lng
- Polígonos coloridos por status_saude das áreas
- InfoWindow de fazenda: nome, total de áreas, link /areas
- InfoWindow de área: nome, fazenda, hectares, status, link /areas/[id]

### Painel lateral (PainelStatusAreas.tsx)
- Card branco w-72, lista de áreas com ponto colorido + nome + status
- Clicar numa área centraliza o mapa nela
- Botão "Gestão de Áreas" → /areas

### Legenda (LegendaMapa.tsx)
- Canto inferior esquerdo do mapa, card translúcido
- Verde = excelente | Amarelo = estável | Vermelho = crítico | Cinza = sem dados

### Componentes em /components/home/
- MapaPropriedade.tsx, PainelStatusAreas.tsx, ResumoRapido.tsx, LegendaMapa.tsx

## Tela de vendas
- Listagem de vendas
- Filtros por cliente, data e status

## Tela nova venda
- Cabeçalho da venda
- Inclusão de itens
- Resumo dos totais
- Salvar

## Tela detalhe da venda
- Visualização completa
- Edição do cabeçalho
- Edição dos itens
- Exclusão controlada

## Tela /fazendas (refatorada em 2026-04-19)

Layout em duas colunas:

### Coluna esquerda — Formulário em cascata

**Seção 1 — Fazenda**
- Select de fazendas existentes OU botão "Nova Fazenda"
- Form inline para criar/editar fazenda

**Seção 2 — Área** (aparece após selecionar fazenda)
- Select de áreas da fazenda selecionada OU botão "Nova Área"
- Form inline para criar/editar área (campos: numero, nome, descricao)

**Seção 3 — Setor** (aparece após selecionar área)
- Form inline para criar/editar setor (campos: numero, nome, hect, descricao)
- Setor fica vinculado à área selecionada via area_id

### Coluna direita — Estrutura hierárquica (HierarquiaView)

Exibe em árvore:
```
📍 FAZENDA
  └─ 🟦 Área (numero)
       └─ 🟩 Setor — Nº X — Y ha
```
Cada nó tem botões Editar e Excluir inline.
Atualiza em tempo real conforme CRUD.

### Regras de negócio aplicadas
- Fazenda só pode ser excluída se não tiver áreas vinculadas
- Área só pode ser excluída se não tiver setores vinculados
- Setor pode ser excluído diretamente
- Toda lógica de negócio fica nos hooks (useFazendas, useAreas, useSetores)

---

## Tela /relatorios (atualizada em 2026-04-20)

### Cabeçalho
- Empresa: NOLASCO PRODUÇÃO
- Título: Relatório de Produção e Vendas
- Cabeçalho visível na tela e no PDF (oculto via `.print-only` / `.no-print`)

### Filtros (ocultos na impressão)
- Colheita-campo, Setor, Período início/fim

### Botão Exportar (dropdown)
- **Imprimir / Salvar PDF** → aciona `window.print()` com estilos de `print.css`
- **CSV** → exporta cada relatório individualmente

### Seções do relatório

**Produção por Setor** — colunas: #, Setor, Lote, Total de Cachos, Hectares, Peso Corrigido (kg), Prod./Hectare (kg/ha)
- Rodapé com total de cachos e total de peso corrigido

**Vendas por Lote** — colunas: Lote, Ordem, Cliente, Data, Peso Total, Valor Total, Status
- Rodapé com total de peso e valor

**Consolidado por Lote** — colunas: Lote, Total Cachos, Peso Corrigido, Peso Vendido, Diferença
- Rodapé com totais de todas as colunas numéricas

### PDF (`app/relatorios/print.css`)
- Tamanho A4, margens definidas
- Sidebar, header de navegação, filtros e botões ocultos
- Rodapé automático com número de página e nome da empresa
- Cabeçalho do relatório (empresa + filtros aplicados + data) visível no topo

---

## Módulo de Estoque (implementado em 2026-04-20)

### Padrão visual
- Fundo: bg-[#f8f9fa] (padrão do projeto)
- Botão primário: bg-[#1a3a2a] text-white (verde escuro)
- Badges categoria: rounded-full, cores por tipo (verde/laranja/azul/cinza)
- Status: ponto colorido + texto + ícone ▲ para crítico
- Números de quantidade: text-3xl font-black

### /estoque — Painel de Estoque
- 4 cards de resumo: total ativos, em alerta, em crítico, movimentações hoje
- Banner AlertaCritico (vermelho) se houver itens críticos
- Lista de InsumoCard com busca e filtros por categoria (pills)
- Rodapé com contagem e itens abaixo do mínimo

### /estoque/insumos — Gestão de Insumos
- Formulário inline para criar/editar insumos
- Filtros por categoria (pills) + busca por nome/lote
- Tabela completa: categoria, nome+lote, marca, quantidade, status, validade, ações
- Rodapé com cards: total ativo, próxima validade, itens críticos
- Ações: Movimentar (redireciona), Editar (inline), Excluir (bloqueado se tiver movimentações)

### /estoque/movimentar — Movimentação de Estoque
- Dois cards de tipo de operação: Entrada ↓ / Saída ↑
- Seleção de insumo + painel lateral com saldo atual
- Campos: quantidade, data
- Localização em cascata: Fazenda → Área → Setor (selects dependentes)
- Observação opcional
- Histórico das últimas 24h em cards laterais
- Validação: saída não pode deixar saldo negativo

### /estoque/categorias — Categorias de Insumos
- Formulário inline: nome, tipo (fertilizante/defensivo/semente/outros), descrição, ativo
- Tabela com ações editar/excluir
- Exclusão bloqueada se houver insumos vinculados

### Navegação
- Grupo "Estoque" adicionado na Sidebar (independente do grupo Cadastros)
- Sidebar refatorada: cada grupo tem estado aberto/fechado independente
