'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PdcaCiclo, PdcaCicloInsert, PdcaFase } from '@/types/pdca'

function mapear(row: Record<string, unknown>): PdcaCiclo {
  const criador = row['usuarios'] as { nome: string } | null
  return {
    id:                Number(row['id']),
    titulo:            String(row['titulo'] ?? ''),
    descricao:         row['descricao']         != null ? String(row['descricao'])         : null,
    fase_atual:        String(row['fase_atual'] ?? 'planejar') as PdcaFase,
    data_inicio:       row['data_inicio']       != null ? String(row['data_inicio'])       : null,
    data_fim_prevista: row['data_fim_prevista'] != null ? String(row['data_fim_prevista']) : null,
    criado_por:        row['criado_por']        != null ? Number(row['criado_por'])        : null,
    criado_por_nome:   criador?.nome ?? null,
    created_at:        String(row['created_at'] ?? ''),
    updated_at:        row['updated_at']        != null ? String(row['updated_at'])        : null,
  }
}

export function usePdcaCiclos() {
  const [registros, setRegistros] = useState<PdcaCiclo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    const { data, error } = await supabase
      .from('pdca_ciclos')
      .select('*, usuarios:criado_por (nome)')
      .order('created_at', { ascending: false })

    setCarregando(false)
    if (error) { setErro(error.message); return }

    setRegistros(((data ?? []) as Record<string, unknown>[]).map(mapear))
  }

  async function salvar(payload: PdcaCicloInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const { error } = id
      ? await supabase
          .from('pdca_ciclos')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', id)
      : await supabase
          .from('pdca_ciclos')
          .insert([payload])

    setSalvando(false)
    if (error) { setErro(error.message); return false }

    setMensagem(id ? 'Ciclo atualizado.' : 'Ciclo criado com sucesso.')
    await carregar()
    return true
  }

  async function avancarFase(id: number, fase: PdcaFase): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const { error } = await supabase
      .from('pdca_ciclos')
      .update({ fase_atual: fase, updated_at: new Date().toISOString() })
      .eq('id', id)

    setSalvando(false)
    if (error) { setErro(error.message); return false }

    setMensagem(`Ciclo avançado para "${fase}".`)
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir este ciclo e todas as suas tarefas?')) return false

    setErro(null)
    setMensagem(null)

    const { error } = await supabase
      .from('pdca_ciclos')
      .delete()
      .eq('id', id)

    if (error) { setErro(error.message); return false }

    setMensagem('Ciclo excluído.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return {
    registros, carregando, salvando, erro, mensagem,
    carregar, salvar, avancarFase, excluir,
    setErro, setMensagem,
  }
}
