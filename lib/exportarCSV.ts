import type {
  LinhaColheitaPorLote,
  LinhaProducaoPorSetor,
  LinhaVendaPorLote,
  LinhaConsolidado,
} from '@/hooks/useRelatorios'

// ─── Utilitários internos ──────────────────────────────────────────────────

function escaparCelula(valor: string): string {
  if (valor.includes(';') || valor.includes('"') || valor.includes('\n')) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

function baixarCSV(nomeArquivo: string, linhas: string[][]): void {
  const bom = '\uFEFF' // BOM para Excel reconhecer UTF-8 corretamente
  const conteudo = bom + linhas.map((row) => row.map(escaparCelula).join(';')).join('\r\n')
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}

function fmt(v: number | null, casas = 2): string {
  if (v === null || Number.isNaN(v)) return ''
  return v.toFixed(casas).replace('.', ',')
}

function fmtData(iso: string | null): string {
  if (!iso) return ''
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

function nomeComData(base: string): string {
  const hoje = new Date().toISOString().split('T')[0]
  return `${base}_${hoje}.csv`
}

// ─── Exportações por relatório ─────────────────────────────────────────────

export function exportarColheitaPorLote(linhas: LinhaColheitaPorLote[]): void {
  const cabecalho = [
    'Lote',
    'Última Colheita',
    'Registros',
    'Total Cachos',
    'Ratio Médio',
    'Origem Peso',
  ]
  const dados = linhas.map((l) => [
    l.codigo,
    fmtData(l.ultimaColheita),
    String(l.quantidadeRegistros),
    String(l.totalCachos),
    fmt(l.ratioMedio, 3),
    l.origemPesoCacho,
  ])
  baixarCSV(nomeComData('colheita-por-lote'), [cabecalho, ...dados])
}

export function exportarProducaoPorSetor(linhas: LinhaProducaoPorSetor[]): void {
  const cabecalho = [
    '#',
    'Setor',
    'Número Setor',
    'Lote',
    'Total Cachos',
    'Peso obtido',
    'Origem Base',
    'Ratio Médio',
    'Peso Corrigido (kg)',
    'Hectares',
    'Prod/ha (kg/ha)',
  ]
  const dados = linhas.map((l, i) => [
    String(i + 1),
    l.setorNome,
    String(l.setorNumero),
    l.loteCodigo,
    String(l.totalCachos),
    fmt(l.basePeso, 3),
    l.origemBase,
    fmt(l.ratioMedio, 3),
    fmt(l.pesoCorrigido),
    fmt(l.hect),
    fmt(l.prodHectare),
  ])
  baixarCSV(nomeComData('producao-por-setor'), [cabecalho, ...dados])
}

export function exportarVendasPorLote(linhas: LinhaVendaPorLote[]): void {
  const cabecalho = [
    'Lote',
    'Ordem',
    'Cliente',
    'Data',
    'Peso Total (kg)',
    'Valor Total (R$)',
    'Status',
  ]
  const dados = linhas.map((l) => [
    l.loteCodigo,
    l.ordemVenda,
    l.cliente,
    fmtData(l.dataVenda),
    fmt(l.pesoTotal),
    fmt(l.valorTotal),
    l.finalizada ? 'Finalizada' : 'Aberta',
  ])
  baixarCSV(nomeComData('vendas-por-lote'), [cabecalho, ...dados])
}

export function exportarConsolidadoPorLote(linhas: LinhaConsolidado[]): void {
  const cabecalho = [
    'Lote',
    'Total Cachos',
    'Peso Corrigido (kg)',
    'Peso Vendido (kg)',
    'Diferença (kg)',
  ]
  const dados = linhas.map((l) => [
    l.codigo,
    String(l.totalCachos),
    fmt(l.pesoCorrigidoTotal),
    fmt(l.pesoVendidoTotal),
    fmt(l.diferenca),
  ])
  baixarCSV(nomeComData('consolidado-por-lote'), [cabecalho, ...dados])
}
