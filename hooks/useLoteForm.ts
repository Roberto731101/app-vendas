'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LoteInsert } from '@/types/lote'

export function useLoteForm() {
  // "nome" no formulário → coluna "codigo" na tabela lotes_fechamento
  const [nome, setNome] = useState('')
  const [dataReferencia, setDataReferencia] = useState('')
  const [observacao, setObservacao] = useState('')

  // --- Feedback de UI ---
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  function limparFormulario() {
    setNome('')
    setDataReferencia('')
    setObservacao('')
    setErro(null)
    setMensagem(null)
  }

  async function salvarLote() {
    if (!nome.trim()) {
      setErro('O campo Nome é obrigatório.')
      setMensagem(null)
      return
    }

    setSalvando(true)
    setErro(null)
    setMensagem(null)

    const payload: LoteInsert = {
      codigo: nome.trim(),
      data_referencia: dataReferencia || null,
      observacao: observacao.trim() || null,
    }

    const { error } = await supabase.from('lotes_fechamento').insert([payload])

    setSalvando(false)

    if (error) {
      setErro(error.message)
      return
    }

    limparFormulario()
    setMensagem('Lote salvo com sucesso.')
  }

  return {
    nome,
    setNome,
    dataReferencia,
    setDataReferencia,
    observacao,
    setObservacao,

    erro,
    mensagem,
    salvando,

    salvarLote,
    limparFormulario,
  }
}
