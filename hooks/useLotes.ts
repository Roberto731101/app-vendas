'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Lote = {
  id: number
  codigo: string
  data_referencia: string | null
  observacao: string | null
  created_at: string
}

export type LoteInsert = {
  codigo: string
  data_referencia: string | null
  observacao: string | null
}

export function useLotes() {
  const [registros, setRegistros] = useState<Lote[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('lotes_fechamento')
      .select('*')
      .order('id', { ascending: false })
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as Lote[]) ?? [])
  }

  async function buscarPorId(id: number): Promise<Lote | null> {
    const { data, error } = await supabase
      .from('lotes_fechamento')
      .select('*')
      .eq('id', id)
      .single()
    if (error) { setErro(error.message); return null }
    return data as Lote
  }

  async function salvar(payload: LoteInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('lotes_fechamento').update(payload).eq('id', id)
      : await supabase.from('lotes_fechamento').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Lote atualizado com sucesso.' : 'Lote cadastrado com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir este lote?')) return false
    const { error } = await supabase.from('lotes_fechamento').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Lote excluído com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return { registros, carregando, erro, mensagem, salvando, carregar, buscarPorId, salvar, excluir }
}
