'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Periodo = 'hoje' | '7dias' | 'mes' | 'ano' | 'personalizado'

export const PERIODOS: { valor: Periodo; label: string }[] = [
  { valor: 'hoje',          label: 'Hoje' },
  { valor: '7dias',         label: 'Últimos 7 dias' },
  { valor: 'mes',           label: 'Mês atual' },
  { valor: 'ano',           label: 'Ano atual' },
  { valor: 'personalizado', label: 'Personalizado' },
]

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

type ResumoClassificacao = {
  classificacao: string
  valor: number
  peso: number
}

export type PontoGrafico = {
  label: string
  valor: number
}

export type ItemRanking = {
  nome: string
  valor: number
}

export type DashboardVendas = {
  totalVendas: number
  vendasAbertas: number
  vendasFinalizadas: number
  valorTotalVendido: number
  pesoTotalVendido: number
  porClassificacao: ResumoClassificacao[]
  vendasPorDia: PontoGrafico[]
  pesosPorDia: PontoGrafico[]
  topClientes: ItemRanking[]
  topProdutos: ItemRanking[]
  topProdutosPeso: ItemRanking[]
}

const ESTADO_INICIAL: DashboardVendas = {
  totalVendas: 0,
  vendasAbertas: 0,
  vendasFinalizadas: 0,
  valorTotalVendido: 0,
  pesoTotalVendido: 0,
  porClassificacao: [],
  vendasPorDia: [],
  pesosPorDia: [],
  topClientes: [],
  topProdutos: [],
  topProdutosPeso: [],
}

function toISO(d: Date): string {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function calcularIntervalo(
  periodo: Periodo,
  dataInicio?: string,
  dataFim?: string,
): { inicio: string; fim: string } {
  const hoje = new Date()
  const fim = toISO(hoje)

  switch (periodo) {
    case 'hoje':
      return { inicio: fim, fim }
    case '7dias': {
      const d = new Date(hoje)
      d.setDate(d.getDate() - 6)
      return { inicio: toISO(d), fim }
    }
    case 'mes': {
      const d = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      return { inicio: toISO(d), fim }
    }
    case 'ano': {
      const d = new Date(hoje.getFullYear(), 0, 1)
      return { inicio: toISO(d), fim }
    }
    case 'personalizado':
      return { inicio: dataInicio ?? fim, fim: dataFim ?? fim }
  }
}

// Para 'ano': agrupa por mês (YYYY-MM). Para os demais: por dia (YYYY-MM-DD).
function formatarLabel(chave: string, periodo: Periodo): string {
  if (periodo === 'ano') {
    const mes = parseInt(chave.split('-')[1], 10) - 1
    return MESES[mes] ?? chave
  }
  const [, mes, dia] = chave.split('-')
  return `${dia}/${mes}`
}

function agregarPorPeriodo(
  itens: { venda_id: number; valor_total: number }[],
  mapaDataVenda: Record<number, string>,
  periodo: Periodo
): PontoGrafico[] {
  const mapa: Record<string, number> = {}

  for (const item of itens) {
    const dataISO = mapaDataVenda[item.venda_id]
    if (!dataISO) continue
    const chave = periodo === 'ano' ? dataISO.slice(0, 7) : dataISO
    mapa[chave] = (mapa[chave] ?? 0) + (item.valor_total ?? 0)
  }

  return Object.entries(mapa)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, valor]) => ({ label: formatarLabel(chave, periodo), valor }))
}

function agregarPesoPorPeriodo(
  itens: { venda_id: number; peso_total: number }[],
  mapaDataVenda: Record<number, string>,
  periodo: Periodo
): PontoGrafico[] {
  const mapa: Record<string, number> = {}

  for (const item of itens) {
    const dataISO = mapaDataVenda[item.venda_id]
    if (!dataISO) continue
    const chave = periodo === 'ano' ? dataISO.slice(0, 7) : dataISO
    mapa[chave] = (mapa[chave] ?? 0) + (item.peso_total ?? 0)
  }

  return Object.entries(mapa)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, valor]) => ({ label: formatarLabel(chave, periodo), valor }))
}

export function useDashboardVendas() {
  const [dados, setDados] = useState<DashboardVendas>(ESTADO_INICIAL)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  async function carregar(p: Periodo = periodo, ini?: string, fim_?: string) {
    if (p === 'personalizado' && (!( ini ?? dataInicio) || !(fim_ ?? dataFim))) return
    setCarregando(true)
    setErro(null)

    const { inicio, fim } = calcularIntervalo(p, ini ?? dataInicio, fim_ ?? dataFim)

    const resVendas = await supabase
      .from('vendas')
      .select('id, finalizada, data_venda, cliente')
      .gte('data_venda', inicio)
      .lte('data_venda', fim)

    if (resVendas.error) {
      setErro(resVendas.error.message)
      setCarregando(false)
      return
    }

    const vendas = resVendas.data ?? []
    const vendaIds = vendas.map((v) => v.id)

    let itens: { classificacao: string; valor_total: number; peso_total: number; venda_id: number; produto: string }[] = []

    if (vendaIds.length > 0) {
      const resItens = await supabase
        .from('itens_venda')
        .select('classificacao, valor_total, peso_total, venda_id, produto')
        .in('venda_id', vendaIds)

      if (resItens.error) {
        setErro(resItens.error.message)
        setCarregando(false)
        return
      }

      itens = resItens.data ?? []
    }

    setCarregando(false)

    // --- Indicadores de vendas ---
    const totalVendas       = vendas.length
    const vendasFinalizadas = vendas.filter((v) => v.finalizada).length
    const vendasAbertas     = totalVendas - vendasFinalizadas

    // --- Indicadores financeiros ---
    const valorTotalVendido = itens.reduce((acc, i) => acc + (i.valor_total ?? 0), 0)
    const pesoTotalVendido  = itens.reduce((acc, i) => acc + (i.peso_total  ?? 0), 0)

    // --- Por classificação ---
    const mapaClassificacao = itens.reduce<Record<string, ResumoClassificacao>>((acc, i) => {
      const chave = i.classificacao ?? 'Sem classificação'
      if (!acc[chave]) acc[chave] = { classificacao: chave, valor: 0, peso: 0 }
      acc[chave].valor += i.valor_total ?? 0
      acc[chave].peso  += i.peso_total  ?? 0
      return acc
    }, {})

    const porClassificacao = Object.values(mapaClassificacao).sort(
      (a, b) => b.valor - a.valor
    )

    // --- Série temporal para o gráfico ---
    const mapaDataVenda: Record<number, string> = {}
    const mapaClienteVenda: Record<number, string> = {}
    for (const v of vendas) {
      if (v.data_venda) mapaDataVenda[v.id] = v.data_venda
      if (v.cliente)    mapaClienteVenda[v.id] = v.cliente
    }

    const vendasPorDia = agregarPorPeriodo(itens, mapaDataVenda, p)
    const pesosPorDia  = agregarPesoPorPeriodo(itens, mapaDataVenda, p)

    // --- Rankings ---
    const mapaClientes: Record<string, number> = {}
    const mapaProdutos: Record<string, number> = {}
    const mapaProdutosPeso: Record<string, number> = {}

    for (const item of itens) {
      const cliente = mapaClienteVenda[item.venda_id] ?? 'Sem cliente'
      mapaClientes[cliente] = (mapaClientes[cliente] ?? 0) + (item.valor_total ?? 0)

      const produto = item.produto ?? 'Sem produto'
      mapaProdutos[produto]     = (mapaProdutos[produto]     ?? 0) + (item.valor_total ?? 0)
      mapaProdutosPeso[produto] = (mapaProdutosPeso[produto] ?? 0) + (item.peso_total  ?? 0)
    }

    const topClientes = Object.entries(mapaClientes)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)

    const topProdutos = Object.entries(mapaProdutos)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)

    const topProdutosPeso = Object.entries(mapaProdutosPeso)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)

    setDados({
      totalVendas,
      vendasAbertas,
      vendasFinalizadas,
      valorTotalVendido,
      pesoTotalVendido,
      porClassificacao,
      vendasPorDia,
      pesosPorDia,
      topClientes,
      topProdutos,
      topProdutosPeso,
    })
  }

  function selecionarPeriodo(p: Periodo) {
    setPeriodo(p)
    if (p !== 'personalizado') carregar(p)
  }

  function aplicarPersonalizado(ini: string, fim: string) {
    setDataInicio(ini)
    setDataFim(fim)
    carregar('personalizado', ini, fim)
  }

  useEffect(() => {
    carregar(periodo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    dados,
    carregando,
    erro,
    periodo,
    selecionarPeriodo,
    recarregar: () => carregar(periodo),
    dataInicio,
    dataFim,
    aplicarPersonalizado,
  }
}
