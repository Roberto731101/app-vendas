'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Colheita, Lote, Setor } from '@/types/colheita'

// Colheita com join de setores — resultado da query com select relacional
export type ColheitaLista = Colheita & {
  setores: {
    id: number
    nome: string
    numero: number
  } | null
}

export function useColheitaForm(loteIdInicial?: number) {
  // --- Dados de lookup (selects) ---
  const [lotes, setLotes] = useState<Lote[]>([])
  const [setores, setSetores] = useState<Setor[]>([])

  // --- Estado do contexto do lote (cabeçalho) ---
  const [loteId, setLoteId] = useState(loteIdInicial ? String(loteIdInicial) : '')
  const [dataColheita, setDataColheita] = useState('')
  const [observacaoGeral, setObservacaoGeral] = useState('')

  // --- Estado do formulário de linha (entrada rápida) ---
  const [setorId, setSetorId] = useState('')
  const [numeroCachos, setNumeroCachos] = useState('')
  const [amostraPesoCacho, setAmostraPesoCacho] = useState('')
  const [observacaoLinha, setObservacaoLinha] = useState('')

  // --- Colheitas do lote selecionado ---
  const [colheitas, setColheitas] = useState<ColheitaLista[]>([])

  // --- Feedback de UI ---
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [carregandoLista, setCarregandoLista] = useState(false)

  // --- Funções auxiliares ---

  function limparCamposLinha() {
    setSetorId('')
    setNumeroCachos('')
    setAmostraPesoCacho('')
    setObservacaoLinha('')
  }

  // --- Funções de carregamento ---

  async function carregarLotes() {
    const { data, error } = await supabase
      .from('lotes_fechamento')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      setErro(error.message)
      return
    }

    setLotes((data as Lote[]) || [])
  }

  async function carregarSetores() {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .order('numero', { ascending: true })

    if (error) {
      setErro(error.message)
      return
    }

    setSetores((data as Setor[]) || [])
  }

  async function carregarColheitasPorLote(idLote: number) {
    setCarregandoLista(true)

    const { data, error } = await supabase
      .from('controle_colheita')
      .select(`
        *,
        setores (
          id,
          nome,
          numero
        )
      `)
      .eq('lote_id', idLote)
      .order('id', { ascending: true })

    setCarregandoLista(false)

    if (error) {
      setErro(error.message)
      setColheitas([])
      return
    }

    setColheitas((data as ColheitaLista[]) || [])
  }

  // --- Efeitos ---

  useEffect(() => {
    carregarLotes()
    carregarSetores()
  }, [])

  useEffect(() => {
    if (loteId) {
      carregarColheitasPorLote(Number(loteId))
    } else {
      setColheitas([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId])

  // --- Handlers de negócio ---

  async function adicionarColheita() {
    if (!loteId || !dataColheita || !setorId || !numeroCachos) {
      setErro('Preencha Lote, Data da Colheita, Setor e Número de Cachos.')
      setMensagem(null)
      return
    }

    const numeroCachosNum = Number(numeroCachos)
    const amostraNum =
      amostraPesoCacho.trim() === '' ? null : Number(amostraPesoCacho)

    if (Number.isNaN(numeroCachosNum) || numeroCachosNum <= 0) {
      setErro('Número de Cachos precisa ser numérico e maior que zero.')
      setMensagem(null)
      return
    }

    if (amostraNum !== null && (Number.isNaN(amostraNum) || amostraNum <= 0)) {
      setErro('Amostra Peso Cacho, quando informada, precisa ser numérica e maior que zero.')
      setMensagem(null)
      return
    }

    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const { error } = await supabase.from('controle_colheita').insert([
      {
        lote_id: Number(loteId),
        data_colheita: dataColheita,
        setor_id: Number(setorId),
        numero_cachos: numeroCachosNum,
        amostra_peso_cacho: amostraNum,
        observacao: observacaoLinha.trim() || observacaoGeral.trim() || null,
      },
    ])

    setSalvando(false)

    if (error) {
      setErro(error.message)
      return
    }

    limparCamposLinha()
    await carregarColheitasPorLote(Number(loteId))
    setMensagem('Colheita adicionada com sucesso.')
  }

  function limparFormulario() {
    setLoteId('')
    setDataColheita('')
    setObservacaoGeral('')
    limparCamposLinha()
    setErro(null)
    setMensagem(null)
    setColheitas([])
  }

  // --- Valores derivados ---

  const resumo = useMemo(() => {
    const totalLinhas = colheitas.length
    const totalCachos = colheitas.reduce((acc, item) => acc + item.numero_cachos, 0)

    const colheitasComAmostra = colheitas.filter(
      (item) => item.amostra_peso_cacho !== null && item.amostra_peso_cacho !== undefined
    )

    const mediaAmostra =
      colheitasComAmostra.length > 0
        ? colheitasComAmostra.reduce(
            (acc, item) => acc + Number(item.amostra_peso_cacho || 0),
            0
          ) / colheitasComAmostra.length
        : 0

    return {
      totalLinhas,
      totalCachos,
      mediaAmostra,
    }
  }, [colheitas])

  const loteSelecionado = useMemo(
    () => lotes.find((item) => String(item.id) === loteId) ?? null,
    [loteId, lotes]
  )

  return {
    // Dados de lookup
    lotes,
    setores,

    // Estado: contexto do lote
    loteId,
    setLoteId,
    dataColheita,
    setDataColheita,
    observacaoGeral,
    setObservacaoGeral,

    // Estado: formulário de linha
    setorId,
    setSetorId,
    numeroCachos,
    setNumeroCachos,
    amostraPesoCacho,
    setAmostraPesoCacho,
    observacaoLinha,
    setObservacaoLinha,

    // Colheitas do lote
    colheitas,

    // Feedback
    erro,
    mensagem,
    salvando,
    carregandoLista,

    // Handlers
    adicionarColheita,
    limparFormulario,

    // Loaders expostos para reuso nas telas
    carregarColheitasPorLote,

    // Valores derivados
    resumo,
    loteSelecionado,
  }
}
