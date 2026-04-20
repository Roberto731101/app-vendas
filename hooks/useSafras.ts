'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Safra = {
  id: number
  nome: string
  data_inicio: string
  data_fim: string
  ativo: boolean
  created_at: string
}

export type SafraInsert = {
  nome: string
  data_inicio: string
  data_fim: string
  ativo: boolean
}

export function useSafras() {
  const [registros, setRegistros]   = useState<Safra[]>([])
  const [ativa, setAtiva]           = useState<Safra | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]             = useState<string | null>(null)
  const [mensagem, setMensagem]     = useState<string | null>(null)
  const [salvando, setSalvando]     = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('safras')
      .select('*')
      .order('data_inicio', { ascending: false })
    setCarregando(false)
    if (error) { setErro(error.message); return }
    const lista = (data as Safra[]) ?? []
    setRegistros(lista)
    setAtiva(lista.find((s) => s.ativo) ?? lista[0] ?? null)
  }

  async function salvar(payload: SafraInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('safras').update(payload).eq('id', id)
      : await supabase.from('safras').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Safra atualizada com sucesso.' : 'Safra cadastrada com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    const { count } = await supabase
      .from('cotas_insumos_area')
      .select('id', { count: 'exact', head: true })
      .eq('safra_id', id)
    if ((count ?? 0) > 0) {
      setErro('Não é possível excluir esta safra pois ela possui cotas vinculadas.')
      return false
    }
    if (!window.confirm('Excluir esta safra?')) return false
    const { error } = await supabase.from('safras').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Safra excluída com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return { registros, ativa, carregando, erro, mensagem, salvando, carregar, salvar, excluir, setErro, setMensagem }
}
