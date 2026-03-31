'use client'

/**
 * useRelatorios
 *
 * Hook unificado para os 4 blocos do módulo de relatórios.
 * Gerencia filtros, busca os dados em paralelo e deriva cada relatório.
 *
 * Fontes de dados:
 *   Relatório 1 (Colheita por Lote)   → vw_peso_setor_corrigido + lotes_fechamento
 *   Relatório 2 (Produção por Setor)  → vw_peso_setor_corrigido + setores + lotes_fechamento
 *   Relatório 3 (Vendas por Lote)     → vendas + itens_venda + lotes_fechamento
 *   Relatório 4 (Consolidado)         → vw_peso_setor_corrigido + vendas + itens_venda
 */

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  calcularPesoCachoEfetivo,
  type OrigemPesoCacho,
} from '@/lib/pesoCachoEfetivo'

// ─── Filtros ───────────────────────────────────────────────────────────────

export type FiltrosRelatorio = {
  loteId: string
  setorId: string
  dataInicio: string
  dataFim: string
}

const FILTROS_INICIAIS: FiltrosRelatorio = {
  loteId: '',
  setorId: '',
  dataInicio: '',
  dataFim: '',
}

// ─── Tipos de saída ────────────────────────────────────────────────────────

export type LinhaColheitaPorLote = {
  lote_id: number
  codigo: string
  ultimaColheita: string
  quantidadeRegistros: number
  totalCachos: number
  mediaAmostra: number | null
  mediaVenda: number | null
  ratioMedio: number | null
  origemPesoCacho: OrigemPesoCacho
}

export type OrigemBase = 'AMOSTRA' | 'RATIO' | 'SEM_BASE'

export type LinhaProducaoPorSetor = {
  setor_id: number
  setorNome: string
  setorNumero: number
  lote_id: number | null
  loteCodigo: string
  totalCachos: number
  pesoCorrigido: number
  hect: number | null
  prodHectare: number | null
  basePeso: number | null
  origemBase: OrigemBase
  ratioMedio: number | null
}

export type LinhaVendaPorLote = {
  venda_id: number
  loteCodigo: string
  ordemVenda: string
  cliente: string
  dataVenda: string | null
  pesoTotal: number
  valorTotal: number
  finalizada: boolean
}

export type LinhaConsolidado = {
  lote_id: number
  codigo: string
  totalCachos: number
  pesoCorrigidoTotal: number
  pesoVendidoTotal: number
  diferenca: number
}

// ─── Tipos internos para as queries ───────────────────────────────────────

type LinhaBruta = {
  lote_id: number | null
  setor_id: number
  data_colheita: string
  numero_cachos: number
  amostra_peso_cacho: number | null
  media_amostra: number | null
  ratio_medio: number | null
  peso_setor_corrigido: number | null
}

type SetorBruto = {
  id: number
  nome: string
  numero: number
  hect: number | null
}

type LoteBruto = {
  id: number
  codigo: string
}

type ItemVendaBruto = {
  venda_id: number
  peso_total: number
  valor_total: number
}

type VendaBruta = {
  id: number
  lote_id: number | null
  ordem_venda: string
  cliente: string
  data_venda: string | null
  finalizada: boolean
  itens_venda: ItemVendaBruto[]
}

// ─── Opções para selects de filtro ────────────────────────────────────────

export type OpcaoFiltro = { id: number; label: string }

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useRelatorios() {
  const [filtros, setFiltros] = useState<FiltrosRelatorio>(FILTROS_INICIAIS)

  // Opções para os selects dos filtros (carregadas uma vez)
  const [opcoesLote, setOpcoesLote] = useState<OpcaoFiltro[]>([])
  const [opcoesSetor, setOpcoesSetor] = useState<OpcaoFiltro[]>([])

  // Resultados dos 4 relatórios
  const [relColheita, setRelColheita] = useState<LinhaColheitaPorLote[]>([])
  const [relProducao, setRelProducao] = useState<LinhaProducaoPorSetor[]>([])
  const [relVendas, setRelVendas] = useState<LinhaVendaPorLote[]>([])
  const [relConsolidado, setRelConsolidado] = useState<LinhaConsolidado[]>([])

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const primeiraVezRef = useRef(true)

  // ── Carrega opções para os selects (uma única vez) ──────────────────────

  async function carregarOpcoes() {
    const [resLotes, resSetores] = await Promise.all([
      supabase.from('lotes_fechamento').select('id, codigo').order('id', { ascending: false }),
      supabase.from('setores').select('id, nome, numero').order('numero', { ascending: true }),
    ])
    if (!resLotes.error) {
      setOpcoesLote(
        ((resLotes.data as LoteBruto[]) ?? []).map((l) => ({ id: l.id, label: l.codigo }))
      )
    }
    if (!resSetores.error) {
      setOpcoesSetor(
        ((resSetores.data as SetorBruto[]) ?? []).map((s) => ({
          id: s.id,
          label: `${s.nome} — Nº ${s.numero}`,
        }))
      )
    }
  }

  // ── Busca principal ─────────────────────────────────────────────────────

  async function carregar(f: FiltrosRelatorio) {
    setCarregando(true)
    setErro(null)

    // Query da view com filtros
    let queryView = supabase
      .from('vw_peso_setor_corrigido')
      .select('lote_id, setor_id, data_colheita, numero_cachos, amostra_peso_cacho, media_amostra, ratio_medio, peso_setor_corrigido')

    if (f.loteId)     queryView = queryView.eq('lote_id', Number(f.loteId))
    if (f.setorId)    queryView = queryView.eq('setor_id', Number(f.setorId))
    if (f.dataInicio) queryView = queryView.gte('data_colheita', f.dataInicio)
    if (f.dataFim)    queryView = queryView.lte('data_colheita', f.dataFim)

    // Query de vendas com filtros
    let queryVendas = supabase
      .from('vendas')
      .select('id, lote_id, ordem_venda, cliente, data_venda, finalizada, itens_venda(venda_id, peso_total, valor_total)')
      .order('data_venda', { ascending: false })

    if (f.loteId)     queryVendas = queryVendas.eq('lote_id', Number(f.loteId))
    if (f.dataInicio) queryVendas = queryVendas.gte('data_venda', f.dataInicio)
    if (f.dataFim)    queryVendas = queryVendas.lte('data_venda', f.dataFim)

    const [resView, resVendas, resSetores, resLotes] = await Promise.all([
      queryView,
      queryVendas,
      supabase.from('setores').select('id, nome, numero, hect').order('numero', { ascending: true }),
      supabase.from('lotes_fechamento').select('id, codigo'),
    ])

    setCarregando(false)

    if (resView.error)   { setErro(resView.error.message); return }
    if (resVendas.error) { setErro(resVendas.error.message); return }

    const linhasView   = (resView.data as LinhaBruta[]) ?? []
    const vendas       = (resVendas.data as VendaBruta[]) ?? []
    const setores      = (resSetores.data as SetorBruto[]) ?? []
    const lotes        = (resLotes.data as LoteBruto[]) ?? []

    const codigoPorLote  = new Map(lotes.map((l) => [l.id, l.codigo]))
    const setorPorId     = new Map(setores.map((s) => [s.id, s]))

    // ── Relatório 1: Colheita por Lote ─────────────────────────────────

    const mapaColheita = new Map<number, {
      totalCachos: number
      quantidade: number
      ultimaColheita: string
      amostrasColheita: number[]
      mediaVenda: number | null
      ratioMedio: number | null
    }>()

    for (const linha of linhasView) {
      if (linha.lote_id === null) continue
      const id = linha.lote_id
      const atual = mapaColheita.get(id)

      const mediaVenda = atual?.mediaVenda ?? (
        linha.media_amostra !== null ? Number(linha.media_amostra) : null
      )
      const amostras = atual?.amostrasColheita ?? []
      if (linha.amostra_peso_cacho !== null) amostras.push(Number(linha.amostra_peso_cacho))

      mapaColheita.set(id, {
        totalCachos:       (atual?.totalCachos ?? 0) + linha.numero_cachos,
        quantidade:        (atual?.quantidade ?? 0) + 1,
        ultimaColheita:    !atual || linha.data_colheita > atual.ultimaColheita
          ? linha.data_colheita : atual.ultimaColheita,
        amostrasColheita:  amostras,
        mediaVenda,
        ratioMedio: atual?.ratioMedio ?? (linha.ratio_medio !== null ? Number(linha.ratio_medio) : null),
      })
    }

    const colheitaResult: LinhaColheitaPorLote[] = Array.from(mapaColheita.entries())
      .map(([lote_id, d]) => {
        const mediaAmostra = d.amostrasColheita.length > 0
          ? d.amostrasColheita.reduce((a, b) => a + b, 0) / d.amostrasColheita.length
          : null
        const { origemPesoCacho } = calcularPesoCachoEfetivo(mediaAmostra, d.mediaVenda)
        return {
          lote_id,
          codigo:               codigoPorLote.get(lote_id) ?? `Lote ${lote_id}`,
          ultimaColheita:       d.ultimaColheita,
          quantidadeRegistros:  d.quantidade,
          totalCachos:          d.totalCachos,
          mediaAmostra,
          mediaVenda:           d.mediaVenda,
          ratioMedio:           d.ratioMedio,
          origemPesoCacho,
        }
      })
      .sort((a, b) => b.ultimaColheita.localeCompare(a.ultimaColheita))

    setRelColheita(colheitaResult)

    // ── Relatório 2: Produção por Setor ────────────────────────────────
    // Chave: setor_id + lote_id

    const mapaProducao = new Map<string, {
      setor_id: number
      lote_id: number | null
      totalCachos: number
      pesoCorrigido: number
      basePesoAmostra: number | null   // primeiro amostra_peso_cacho não-nulo do grupo
      basePesoRatio: number | null     // primeiro media_amostra (ratio_medio) não-nulo do grupo
      ratioMedio: number | null        // primeiro ratio_medio não-nulo do grupo
    }>()

    for (const linha of linhasView) {
      const chave = `${linha.setor_id}-${linha.lote_id ?? 'null'}`
      const atual = mapaProducao.get(chave)
      mapaProducao.set(chave, {
        setor_id:         linha.setor_id,
        lote_id:          linha.lote_id,
        totalCachos:      (atual?.totalCachos ?? 0) + linha.numero_cachos,
        pesoCorrigido:    (atual?.pesoCorrigido ?? 0) + (linha.peso_setor_corrigido ?? 0),
        basePesoAmostra:  atual?.basePesoAmostra ?? (linha.amostra_peso_cacho !== null ? Number(linha.amostra_peso_cacho) : null),
        basePesoRatio:    atual?.basePesoRatio    ?? (linha.media_amostra    !== null ? Number(linha.media_amostra)    : null),
        ratioMedio:       atual?.ratioMedio        ?? (linha.ratio_medio      !== null ? Number(linha.ratio_medio)      : null),
      })
    }

    const producaoResult: LinhaProducaoPorSetor[] = Array.from(mapaProducao.values())
      .map((d) => {
        const setor = setorPorId.get(d.setor_id)
        const hect = setor?.hect ?? null
        const prodHectare = hect && hect > 0 ? d.pesoCorrigido / hect : null

        const usaAmostra = d.basePesoAmostra !== null
        const basePeso   = usaAmostra ? d.basePesoAmostra : d.basePesoRatio
        const origemBase: OrigemBase = usaAmostra
          ? 'AMOSTRA'
          : d.basePesoRatio !== null
            ? 'RATIO'
            : 'SEM_BASE'

        return {
          setor_id:    d.setor_id,
          setorNome:   setor?.nome ?? `Setor ${d.setor_id}`,
          setorNumero: setor?.numero ?? 0,
          lote_id:     d.lote_id,
          loteCodigo:  d.lote_id !== null
            ? (codigoPorLote.get(d.lote_id) ?? `Lote ${d.lote_id}`)
            : '—',
          totalCachos:  d.totalCachos,
          pesoCorrigido: d.pesoCorrigido,
          hect,
          prodHectare,
          basePeso,
          origemBase,
          ratioMedio: d.ratioMedio,
        }
      })
      .sort((a, b) => (b.prodHectare ?? 0) - (a.prodHectare ?? 0))

    setRelProducao(producaoResult)

    // ── Relatório 3: Vendas por Lote ───────────────────────────────────

    const vendasResult: LinhaVendaPorLote[] = vendas.map((v) => {
      const itens = v.itens_venda ?? []
      const pesoTotal  = itens.reduce((s, i) => s + (i.peso_total  ?? 0), 0)
      const valorTotal = itens.reduce((s, i) => s + (i.valor_total ?? 0), 0)
      return {
        venda_id:   v.id,
        loteCodigo: v.lote_id !== null
          ? (codigoPorLote.get(v.lote_id) ?? `Lote ${v.lote_id}`)
          : '—',
        ordemVenda: v.ordem_venda,
        cliente:    v.cliente,
        dataVenda:  v.data_venda,
        pesoTotal,
        valorTotal,
        finalizada: v.finalizada,
      }
    })

    setRelVendas(vendasResult)

    // ── Relatório 4: Consolidado por Lote ─────────────────────────────

    // Monta mapa de colheita (todos os lotes, mesmo que o filtro de setor esteja ativo)
    // Para o consolidado usamos os dados já agregados de colheita
    const mapaConsolidado = new Map<number, {
      codigo: string
      totalCachos: number
      pesoCorrigidoTotal: number
      pesoVendidoTotal: number
    }>()

    for (const c of colheitaResult) {
      const atual = mapaConsolidado.get(c.lote_id)
      mapaConsolidado.set(c.lote_id, {
        codigo:             c.codigo,
        totalCachos:        (atual?.totalCachos ?? 0) + c.totalCachos,
        pesoCorrigidoTotal: atual?.pesoCorrigidoTotal ?? 0,
        pesoVendidoTotal:   atual?.pesoVendidoTotal ?? 0,
      })
    }

    // Peso corrigido total via view
    for (const linha of linhasView) {
      if (linha.lote_id === null) continue
      const atual = mapaConsolidado.get(linha.lote_id)
      if (!atual) continue
      mapaConsolidado.set(linha.lote_id, {
        ...atual,
        pesoCorrigidoTotal: atual.pesoCorrigidoTotal + (linha.peso_setor_corrigido ?? 0),
      })
    }

    // Peso vendido via vendas
    for (const v of vendas) {
      if (v.lote_id === null) continue
      const pesoVenda = (v.itens_venda ?? []).reduce((s, i) => s + (i.peso_total ?? 0), 0)
      const atual = mapaConsolidado.get(v.lote_id)
      if (!atual) {
        // Lote com vendas mas sem colheita no filtro atual
        mapaConsolidado.set(v.lote_id, {
          codigo:             codigoPorLote.get(v.lote_id) ?? `Lote ${v.lote_id}`,
          totalCachos:        0,
          pesoCorrigidoTotal: 0,
          pesoVendidoTotal:   pesoVenda,
        })
      } else {
        mapaConsolidado.set(v.lote_id, {
          ...atual,
          pesoVendidoTotal: atual.pesoVendidoTotal + pesoVenda,
        })
      }
    }

    const consolidadoResult: LinhaConsolidado[] = Array.from(mapaConsolidado.entries())
      .map(([lote_id, d]) => ({
        lote_id,
        codigo:             d.codigo,
        totalCachos:        d.totalCachos,
        pesoCorrigidoTotal: d.pesoCorrigidoTotal,
        pesoVendidoTotal:   d.pesoVendidoTotal,
        diferenca:          d.pesoCorrigidoTotal - d.pesoVendidoTotal,
      }))
      .sort((a, b) => a.codigo.localeCompare(b.codigo))

    setRelConsolidado(consolidadoResult)
  }

  // ── Efeitos ─────────────────────────────────────────────────────────────

  useEffect(() => {
    carregarOpcoes()
  }, [])

  useEffect(() => {
    if (primeiraVezRef.current) {
      primeiraVezRef.current = false
    }
    carregar(filtros)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  // ── Setters de filtro ────────────────────────────────────────────────────

  function setLoteId(v: string)     { setFiltros((f) => ({ ...f, loteId: v })) }
  function setSetorId(v: string)    { setFiltros((f) => ({ ...f, setorId: v })) }
  function setDataInicio(v: string) { setFiltros((f) => ({ ...f, dataInicio: v })) }
  function setDataFim(v: string)    { setFiltros((f) => ({ ...f, dataFim: v })) }

  function limparFiltros() {
    setFiltros(FILTROS_INICIAIS)
  }

  const filtrosAtivos =
    filtros.loteId !== '' ||
    filtros.setorId !== '' ||
    filtros.dataInicio !== '' ||
    filtros.dataFim !== ''

  return {
    filtros,
    setLoteId,
    setSetorId,
    setDataInicio,
    setDataFim,
    limparFiltros,
    filtrosAtivos,
    opcoesLote,
    opcoesSetor,
    carregando,
    erro,
    relColheita,
    relProducao,
    relVendas,
    relConsolidado,
    recarregar: () => carregar(filtros),
  }
}
