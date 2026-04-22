'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PdcaTarefa, PdcaTarefaInsert, PdcaStatus } from '@/types/pdca'

function mapear(row: Record<string, unknown>): PdcaTarefa {
  const cargo    = row['cargo']    as { nome: string } | null
  const executor = row['executor'] as { nome: string } | null
  const fazenda  = row['fazendas'] as { nome: string } | null
  const area     = row['areas']    as { nome: string } | null
  const setor    = row['setores']  as { nome: string } | null

  return {
    id:            Number(row['id']),
    ciclo_id:      Number(row['ciclo_id']),
    titulo:        String(row['titulo'] ?? ''),
    descricao:     row['descricao']    != null ? String(row['descricao'])    : null,
    cargo_id:      Number(row['cargo_id']),
    cargo_nome:    cargo?.nome ?? null,
    executor_id:   row['executor_id']  != null ? Number(row['executor_id']) : null,
    executor_nome: executor?.nome ?? null,
    status:        String(row['status']     ?? 'a_fazer')  as PdcaStatus,
    prioridade:    String(row['prioridade'] ?? 'media')    as PdcaTarefa['prioridade'],
    prazo:                row['prazo']                != null ? String(row['prazo'])                : null,
    data_inicio_prevista: row['data_inicio_prevista'] != null ? String(row['data_inicio_prevista']) : null,
    data_fim_prevista:    row['data_fim_prevista']    != null ? String(row['data_fim_prevista'])    : null,
    ordem:                Number(row['ordem'] ?? 0),
    fazenda_id:    row['fazenda_id']   != null ? Number(row['fazenda_id'])   : null,
    fazenda_nome:  fazenda?.nome ?? null,
    area_id:       row['area_id']      != null ? Number(row['area_id'])      : null,
    area_nome:     area?.nome ?? null,
    setor_id:      row['setor_id']     != null ? Number(row['setor_id'])     : null,
    setor_nome:    setor?.nome ?? null,
    created_at:    String(row['created_at'] ?? ''),
    updated_at:    row['updated_at']   != null ? String(row['updated_at'])   : null,
  }
}

export function usePdcaTarefas(cicloId: number) {
  const [registros, setRegistros] = useState<PdcaTarefa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    const { data, error } = await supabase
      .from('pdca_tarefas')
      .select(`
        *,
        cargo:cargo_id    ( nome ),
        executor:executor_id ( nome ),
        fazendas ( nome ),
        areas    ( nome ),
        setores  ( nome )
      `)
      .eq('ciclo_id', cicloId)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true })

    setCarregando(false)
    if (error) { setErro(error.message); return }

    setRegistros(((data ?? []) as Record<string, unknown>[]).map(mapear))
  }

  async function salvar(payload: PdcaTarefaInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const { error } = id
      ? await supabase
          .from('pdca_tarefas')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', id)
      : await supabase
          .from('pdca_tarefas')
          .insert([{ ...payload, ciclo_id: cicloId }])

    setSalvando(false)
    if (error) { setErro(error.message); return false }

    setMensagem(id ? 'Tarefa atualizada.' : 'Tarefa criada com sucesso.')
    await carregar()
    return true
  }

  async function alterarStatus(id: number, status: PdcaStatus): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const { error } = await supabase
      .from('pdca_tarefas')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    setSalvando(false)
    if (error) { setErro(error.message); return false }

    // Atualização otimista: reflete localmente antes do reload
    setRegistros((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    )
    return true
  }

  async function atribuirExecutor(id: number, executorId: number | null): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const { error } = await supabase
      .from('pdca_tarefas')
      .update({ executor_id: executorId, updated_at: new Date().toISOString() })
      .eq('id', id)

    setSalvando(false)
    if (error) { setErro(error.message); return false }

    setMensagem(executorId ? 'Executor atribuído.' : 'Executor removido.')
    await carregar()
    return true
  }

  async function reordenar(id: number, novaOrdem: number): Promise<boolean> {
    const { error } = await supabase
      .from('pdca_tarefas')
      .update({ ordem: novaOrdem, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) { setErro(error.message); return false }
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir esta tarefa?')) return false

    setErro(null)
    setMensagem(null)

    const { error } = await supabase
      .from('pdca_tarefas')
      .delete()
      .eq('id', id)

    if (error) { setErro(error.message); return false }

    setMensagem('Tarefa excluída.')
    await carregar()
    return true
  }

  // Derivados para o Kanban
  const aFazer      = registros.filter((t) => t.status === 'a_fazer')
  const emProgresso = registros.filter((t) => t.status === 'em_progresso')
  const concluidas  = registros.filter((t) => t.status === 'concluido')
  const canceladas  = registros.filter((t) => t.status === 'cancelado')

  useEffect(() => {
    if (cicloId) carregar()
  }, [cicloId])

  return {
    registros, aFazer, emProgresso, concluidas, canceladas,
    carregando, salvando, erro, mensagem,
    carregar, salvar, alterarStatus, atribuirExecutor, reordenar, excluir,
    setErro, setMensagem,
  }
}
