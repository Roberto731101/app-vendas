'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type StatusAvaliacao = 1 | 2 | 3
// 1 = não realizado  |  2 = em andamento  |  3 = ok

export type SetorQuadra = {
  id: number
  nome: string
}

export type LinhaProducao = {
  id: number
  setor_id: number
  numero: number
  codigo: string
}

export type Avaliacao = {
  id: number
  linha_id: number
  data_avaliacao: string
  usuario_id: number | null
  status: StatusAvaliacao
  observacao: string | null
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAvaliacao() {
  const [quadras,          setQuadras]          = useState<SetorQuadra[]>([])
  const [linhas,           setLinhas]           = useState<LinhaProducao[]>([])
  const [avaliacoesSalvas, setAvaliacoesSalvas] = useState<Map<number, StatusAvaliacao>>(new Map())

  const [quadraSelecionada, setQuadraSelecionada] = useState<SetorQuadra | null>(null)
  const [dataAvaliacao,     setDataAvaliacao]     = useState<string>(
    new Date().toISOString().slice(0, 10)
  )

  // Estado local dos botões antes de salvar (linha_id → status)
  const [statusLocal, setStatusLocal] = useState<Map<number, StatusAvaliacao>>(new Map())

  const [carregandoQuadras, setCarregandoQuadras] = useState(true)
  const [carregandoLinhas,  setCarregandoLinhas]  = useState(false)
  const [salvando,          setSalvando]          = useState(false)
  const [erro,              setErro]              = useState<string | null>(null)
  const [mensagem,          setMensagem]          = useState<string | null>(null)

  // ── Carregamento das quadras (setores com linhas) ─────────────────────────

  async function carregarQuadras() {
    setCarregandoQuadras(true)
    setErro(null)

    const { data, error } = await supabase
      .from('setores')
      .select('id, nome')
      .like('nome', 'Quadra%')
      .order('nome', { ascending: true })

    setCarregandoQuadras(false)

    if (error) { setErro(error.message); return }

    const com = (data as SetorQuadra[]) ?? []
    setQuadras(com)

    if (com.length > 0 && !quadraSelecionada) {
      setQuadraSelecionada(com[0])
    }
  }

  // ── Carregamento das linhas da quadra selecionada ─────────────────────────

  const carregarLinhas = useCallback(async (setorId: number, data: string) => {
    setCarregandoLinhas(true)
    setErro(null)

    const { data: linhasData, error: linhasError } = await supabase
      .from('linhas_producao')
      .select('id, setor_id, numero, codigo')
      .eq('setor_id', setorId)
      .order('numero', { ascending: true })

    if (linhasError) {
      setErro(linhasError.message)
      setCarregandoLinhas(false)
      return
    }

    const linhasList = (linhasData as LinhaProducao[]) ?? []
    setLinhas(linhasList)

    // Buscar avaliações existentes para essa data
    if (linhasList.length === 0) {
      setAvaliacoesSalvas(new Map())
      setStatusLocal(new Map())
      setCarregandoLinhas(false)
      return
    }

    const ids = linhasList.map((l) => l.id)
    const { data: avsData, error: avsError } = await supabase
      .from('avaliacoes')
      .select('linha_id, status')
      .in('linha_id', ids)
      .eq('data_avaliacao', data)

    if (avsError) {
      setErro(avsError.message)
      setCarregandoLinhas(false)
      return
    }

    const salvas = new Map<number, StatusAvaliacao>(
      (avsData as { linha_id: number; status: StatusAvaliacao }[]).map(
        (a) => [a.linha_id, a.status]
      )
    )
    setAvaliacoesSalvas(salvas)

    // Inicializar estado local com o que já está salvo (ou 1 para novos)
    const local = new Map<number, StatusAvaliacao>()
    for (const l of linhasList) {
      local.set(l.id, salvas.get(l.id) ?? 1)
    }
    setStatusLocal(local)

    setCarregandoLinhas(false)
  }, [])

  // ── Alterar status localmente ─────────────────────────────────────────────

  function alterarStatus(linhaId: number, status: StatusAvaliacao) {
    setStatusLocal((prev) => {
      const next = new Map(prev)
      next.set(linhaId, status)
      return next
    })
  }

  // ── Salvar em lote ────────────────────────────────────────────────────────

  async function finalizarAvaliacao(): Promise<boolean> {
    if (!quadraSelecionada || !dataAvaliacao) {
      setErro('Selecione uma quadra e uma data antes de finalizar.')
      return false
    }
    if (linhas.length === 0) {
      setErro('Nenhuma beca carregada para esta quadra.')
      return false
    }

    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const upsertRows = linhas.map((l) => ({
      linha_id:       l.id,
      data_avaliacao: dataAvaliacao,
      status:         statusLocal.get(l.id) ?? 1,
    }))

    const { error } = await supabase
      .from('avaliacoes')
      .upsert(upsertRows, { onConflict: 'linha_id,data_avaliacao' })

    setSalvando(false)

    if (error) { setErro(error.message); return false }

    setMensagem(`Avaliação de ${linhas.length} becas salva com sucesso.`)
    // Atualizar mapa de salvas com os valores atuais
    setAvaliacoesSalvas(new Map(statusLocal))
    return true
  }

  // ── Efeitos ───────────────────────────────────────────────────────────────

  useEffect(() => { carregarQuadras() }, [])

  useEffect(() => {
    if (quadraSelecionada && dataAvaliacao) {
      carregarLinhas(quadraSelecionada.id, dataAvaliacao)
    }
  }, [quadraSelecionada, dataAvaliacao, carregarLinhas])

  // ── Valores derivados ─────────────────────────────────────────────────────

  const contagem = {
    total:         linhas.length,
    ok:            [...statusLocal.values()].filter((s) => s === 3).length,
    emAndamento:   [...statusLocal.values()].filter((s) => s === 2).length,
    naoRealizado:  [...statusLocal.values()].filter((s) => s === 1).length,
  }

  return {
    // Dados
    quadras,
    linhas,
    avaliacoesSalvas,
    statusLocal,

    // Seleção
    quadraSelecionada,
    setQuadraSelecionada,
    dataAvaliacao,
    setDataAvaliacao,

    // UI
    carregandoQuadras,
    carregandoLinhas,
    salvando,
    erro,
    mensagem,
    setErro,
    setMensagem,

    // Handlers
    alterarStatus,
    finalizarAvaliacao,

    // Derivados
    contagem,
  }
}
