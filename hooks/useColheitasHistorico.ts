'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lote, Setor } from '@/types/colheita'

export type ColheitaHistorico = {
  id: number
  created_at: string
  lote_id: number | null
  setor_id: number
  data_colheita: string
  numero_cachos: number
  amostra_peso_cacho: number | null
  observacao: string | null
  setores: {
    id: number
    nome: string
    numero: number
  } | null
  lotes_fechamento: {
    id: number
    codigo: string
    data_referencia: string | null
  } | null
}

export type FiltrosColheita = {
  dataInicio: string
  dataFim: string
  setorId: string
  loteId: string
  busca: string
}

const FILTROS_INICIAIS: FiltrosColheita = {
  dataInicio: '',
  dataFim: '',
  setorId: '',
  loteId: '',
  busca: '',
}

export function useColheitasHistorico() {
  const [colheitas, setColheitas] = useState<ColheitaHistorico[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // buscaInput: valor imediato do campo de texto
  // filtros.busca: valor aplicado na query (atualizado com debounce)
  const [buscaInput, setBuscaInput] = useState('')
  const [filtros, setFiltros] = useState<FiltrosColheita>(FILTROS_INICIAIS)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Carrega opções para os dropdowns (uma única vez) ---

  async function carregarOpcoes() {
    const [resSetores, resLotes] = await Promise.all([
      supabase.from('setores').select('*').order('numero', { ascending: true }),
      supabase.from('lotes_fechamento').select('*').order('id', { ascending: false }),
    ])

    if (!resSetores.error) setSetores((resSetores.data as Setor[]) || [])
    if (!resLotes.error)   setLotes((resLotes.data as Lote[]) || [])
  }

  // --- Carrega colheitas com filtros aplicados no Supabase ---

  async function carregar(f: FiltrosColheita) {
    setCarregando(true)
    setErro(null)

    let query = supabase
      .from('controle_colheita')
      .select(`
        *,
        setores (id, nome, numero),
        lotes_fechamento (id, codigo, data_referencia)
      `)
      .order('data_colheita', { ascending: false })

    if (f.dataInicio)    query = query.gte('data_colheita', f.dataInicio)
    if (f.dataFim)       query = query.lte('data_colheita', f.dataFim)
    if (f.setorId)       query = query.eq('setor_id', Number(f.setorId))
    if (f.loteId)        query = query.eq('lote_id', Number(f.loteId))
    if (f.busca.trim())  query = query.ilike('observacao', `%${f.busca.trim()}%`)

    const { data, error } = await query

    setCarregando(false)

    if (error) {
      setErro(error.message)
      return
    }

    setColheitas((data as ColheitaHistorico[]) || [])
  }

  // --- Efeitos ---

  useEffect(() => {
    carregarOpcoes()
  }, [])

  // Recarrega automaticamente sempre que os filtros aplicados mudam
  useEffect(() => {
    carregar(filtros)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  // --- Setters de filtro ---

  function atualizarBusca(valor: string) {
    setBuscaInput(valor)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, busca: valor }))
    }, 350)
  }

  function atualizarSetorId(valor: string) {
    setFiltros((prev) => ({ ...prev, setorId: valor }))
  }

  function atualizarLoteId(valor: string) {
    setFiltros((prev) => ({ ...prev, loteId: valor }))
  }

  function atualizarDataInicio(valor: string) {
    setFiltros((prev) => ({ ...prev, dataInicio: valor }))
  }

  function atualizarDataFim(valor: string) {
    setFiltros((prev) => ({ ...prev, dataFim: valor }))
  }

  function limparFiltros() {
    setBuscaInput('')
    setFiltros(FILTROS_INICIAIS)
  }

  const filtrosAtivos =
    filtros.dataInicio !== '' ||
    filtros.dataFim    !== '' ||
    filtros.setorId    !== '' ||
    filtros.loteId     !== '' ||
    filtros.busca      !== ''

  return {
    colheitas,
    setores,
    lotes,
    carregando,
    erro,
    buscaInput,
    filtros,
    filtrosAtivos,
    atualizarBusca,
    atualizarSetorId,
    atualizarLoteId,
    atualizarDataInicio,
    atualizarDataFim,
    limparFiltros,
    recarregar: () => carregar(filtros),
  }
}
