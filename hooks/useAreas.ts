'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Area = {
  id: number
  fazenda_id: number
  numero: string
  nome: string
  descricao: string | null
  created_at: string
}

export type AreaInsert = {
  fazenda_id: number
  numero: string
  nome: string
  descricao: string | null
}

export function useAreas(fazendaId?: number) {
  const [registros, setRegistros] = useState<Area[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    let query = supabase.from('areas').select('*').order('nome', { ascending: true })
    if (fazendaId) query = query.eq('fazenda_id', fazendaId)
    const { data, error } = await query
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as Area[]) ?? [])
  }

  async function salvar(payload: AreaInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('areas').update(payload).eq('id', id)
      : await supabase.from('areas').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Área atualizada com sucesso.' : 'Área cadastrada com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    const { count, error: checkError } = await supabase
      .from('setores')
      .select('id', { count: 'exact', head: true })
      .eq('area_id', id)
    if (checkError) { setErro(checkError.message); return false }
    if ((count ?? 0) > 0) {
      setErro('Não é possível excluir esta área pois ela possui setores vinculados.')
      return false
    }
    if (!window.confirm('Excluir esta área?')) return false
    const { error } = await supabase.from('areas').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Área excluída com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [fazendaId])

  return { registros, carregando, erro, mensagem, salvando, carregar, salvar, excluir, setErro, setMensagem }
}
