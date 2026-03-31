'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Fazenda = {
  id: number
  nome: string
  descricao: string | null
  created_at: string
}

export type FazendaInsert = {
  nome: string
  descricao: string | null
}

export function useFazendas() {
  const [registros, setRegistros] = useState<Fazenda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('fazendas')
      .select('*')
      .order('nome', { ascending: true })
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as Fazenda[]) ?? [])
  }

  async function buscarPorId(id: number): Promise<Fazenda | null> {
    const { data, error } = await supabase
      .from('fazendas')
      .select('*')
      .eq('id', id)
      .single()
    if (error) { setErro(error.message); return null }
    return data as Fazenda
  }

  async function salvar(payload: FazendaInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('fazendas').update(payload).eq('id', id)
      : await supabase.from('fazendas').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Fazenda atualizada com sucesso.' : 'Fazenda cadastrada com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir esta fazenda?')) return false
    const { error } = await supabase.from('fazendas').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Fazenda excluída com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return { registros, carregando, erro, mensagem, salvando, carregar, buscarPorId, salvar, excluir }
}
