'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type TipoMovimentacao = 'entrada' | 'saida'

export type Movimentacao = {
  id: number
  insumo_id: number
  nome_insumo: string
  tipo_movimentacao: TipoMovimentacao
  quantidade: number
  unidade: string
  data_movimentacao: string
  fazenda_id: number | null
  fazenda_nome: string | null
  area_id: number | null
  area_nome: string | null
  setor_id: number | null
  setor_nome: string | null
  observacao: string | null
  created_at: string
}

export type MovimentacaoInsert = {
  insumo_id: number
  tipo_movimentacao: TipoMovimentacao
  quantidade: number
  unidade: string
  data_movimentacao: string
  fazenda_id: number | null
  area_id: number | null
  setor_id: number | null
  observacao: string | null
}

export type FiltrosMovimentacao = {
  insumoId: string
  tipo: string
  fazendaId: string
  dataInicio: string
  dataFim: string
}

const FILTROS_INICIAIS: FiltrosMovimentacao = {
  insumoId: '',
  tipo: '',
  fazendaId: '',
  dataInicio: '',
  dataFim: '',
}

export function useMovimentacoes() {
  const [registros, setRegistros] = useState<Movimentacao[]>([])
  const [recentes, setRecentes] = useState<Movimentacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosMovimentacao>(FILTROS_INICIAIS)
  const [totalHoje, setTotalHoje] = useState(0)

  function mapear(row: Record<string, unknown>): Movimentacao {
    const insumo  = row['insumos']  as { nome_insumo: string; unidade: string } | null
    const fazenda = row['fazendas'] as { nome: string } | null
    const area    = row['areas']    as { nome: string } | null
    const setor   = row['setores']  as { nome: string } | null
    return {
      id:                 Number(row['id']),
      insumo_id:          Number(row['insumo_id']),
      nome_insumo:        insumo?.nome_insumo ?? '',
      tipo_movimentacao:  String(row['tipo_movimentacao']) as TipoMovimentacao,
      quantidade:         Number(row['quantidade']),
      unidade:            String(row['unidade'] ?? insumo?.unidade ?? ''),
      data_movimentacao:  String(row['data_movimentacao']),
      fazenda_id:         row['fazenda_id'] != null ? Number(row['fazenda_id']) : null,
      fazenda_nome:       fazenda?.nome ?? null,
      area_id:            row['area_id'] != null ? Number(row['area_id']) : null,
      area_nome:          area?.nome ?? null,
      setor_id:           row['setor_id'] != null ? Number(row['setor_id']) : null,
      setor_nome:         setor?.nome ?? null,
      observacao:         row['observacao'] != null ? String(row['observacao']) : null,
      created_at:         String(row['created_at']),
    }
  }

  async function carregar(f: FiltrosMovimentacao = filtros) {
    setCarregando(true)
    setErro(null)

    let query = supabase
      .from('movimentacoes_estoque')
      .select(`
        *,
        insumos (nome_insumo, unidade),
        fazendas (nome),
        areas (nome),
        setores (nome)
      `)
      .order('data_movimentacao', { ascending: false })
      .order('created_at', { ascending: false })

    if (f.insumoId)   query = query.eq('insumo_id', Number(f.insumoId))
    if (f.tipo)       query = query.eq('tipo_movimentacao', f.tipo)
    if (f.fazendaId)  query = query.eq('fazenda_id', Number(f.fazendaId))
    if (f.dataInicio) query = query.gte('data_movimentacao', f.dataInicio)
    if (f.dataFim)    query = query.lte('data_movimentacao', f.dataFim)

    const { data, error } = await query
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros(((data ?? []) as Record<string, unknown>[]).map(mapear))

    // Recentes: últimas 24h para o histórico
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)
    const cutoff = ontem.toISOString().slice(0, 10)

    const { data: dataRecentes } = await supabase
      .from('movimentacoes_estoque')
      .select(`*, insumos (nome_insumo, unidade), fazendas (nome), areas (nome), setores (nome)`)
      .gte('data_movimentacao', cutoff)
      .order('created_at', { ascending: false })
      .limit(20)

    setRecentes(((dataRecentes ?? []) as Record<string, unknown>[]).map(mapear))

    // Total hoje
    const hoje = new Date().toISOString().slice(0, 10)
    const { count } = await supabase
      .from('movimentacoes_estoque')
      .select('id', { count: 'exact', head: true })
      .eq('data_movimentacao', hoje)
    setTotalHoje(count ?? 0)
  }

  async function registrar(payload: MovimentacaoInsert): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)

    // Buscar saldo atual
    const { data: insumoData, error: insumoErr } = await supabase
      .from('insumos')
      .select('quantidade_atual, unidade')
      .eq('id', payload.insumo_id)
      .single()

    if (insumoErr || !insumoData) {
      setErro('Insumo não encontrado.')
      setSalvando(false)
      return false
    }

    const saldoAtual = Number((insumoData as { quantidade_atual: number }).quantidade_atual)
    const novoSaldo = payload.tipo_movimentacao === 'entrada'
      ? saldoAtual + payload.quantidade
      : saldoAtual - payload.quantidade

    if (novoSaldo < 0) {
      setErro(`Saldo insuficiente. Disponível: ${saldoAtual} ${(insumoData as { unidade: string }).unidade}.`)
      setSalvando(false)
      return false
    }

    // Inserir movimentação
    const { error: movErr } = await supabase
      .from('movimentacoes_estoque')
      .insert([payload])

    if (movErr) { setErro(movErr.message); setSalvando(false); return false }

    // Atualizar saldo no insumo
    const { error: updErr } = await supabase
      .from('insumos')
      .update({ quantidade_atual: novoSaldo })
      .eq('id', payload.insumo_id)

    setSalvando(false)
    if (updErr) { setErro(updErr.message); return false }

    setMensagem(
      payload.tipo_movimentacao === 'entrada'
        ? `Entrada de ${payload.quantidade} ${payload.unidade} registrada com sucesso.`
        : `Saída de ${payload.quantidade} ${payload.unidade} registrada com sucesso.`
    )
    await carregar(filtros)
    return true
  }

  function setInsumoId(v: string)   { setFiltros((f) => ({ ...f, insumoId: v })) }
  function setTipo(v: string)       { setFiltros((f) => ({ ...f, tipo: v })) }
  function setFazendaId(v: string)  { setFiltros((f) => ({ ...f, fazendaId: v })) }
  function setDataInicio(v: string) { setFiltros((f) => ({ ...f, dataInicio: v })) }
  function setDataFim(v: string)    { setFiltros((f) => ({ ...f, dataFim: v })) }
  function limparFiltros()          { setFiltros(FILTROS_INICIAIS) }

  useEffect(() => { carregar(filtros) }, [filtros])

  return {
    registros, recentes, carregando, erro, mensagem, salvando, filtros, totalHoje,
    registrar, carregar: () => carregar(filtros),
    setInsumoId, setTipo, setFazendaId, setDataInicio, setDataFim, limparFiltros,
    setErro, setMensagem,
  }
}
