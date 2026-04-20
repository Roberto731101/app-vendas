'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Setor = {
  id: number
  numero: number
  nome: string
  hect: number | null
  descricao: string | null
  area_id: number | null
  created_at: string
}

export type SetorInsert = {
  numero: number
  nome: string
  hect: number | null
  descricao: string | null
  area_id: number | null
}

export function useSetores(areaId?: number) {
  const [registros, setRegistros] = useState<Setor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    let query = supabase.from('setores').select('*').order('nome', { ascending: true })
    if (areaId) query = query.eq('area_id', areaId)
    const { data, error } = await query
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as Setor[]) ?? [])
  }

  async function buscarPorId(id: number): Promise<Setor | null> {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('id', id)
      .single()
    if (error) { setErro(error.message); return null }
    return data as Setor
  }

  async function salvar(payload: SetorInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('setores').update(payload).eq('id', id)
      : await supabase.from('setores').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Setor atualizado com sucesso.' : 'Setor cadastrado com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir este setor?')) return false
    const { error } = await supabase.from('setores').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Setor excluído com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [areaId])

  return { registros, carregando, erro, mensagem, salvando, carregar, buscarPorId, salvar, excluir, setErro, setMensagem }
}
