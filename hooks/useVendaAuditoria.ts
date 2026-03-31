'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type RegistroAuditoria = {
  id: number
  venda_id: number
  evento: string
  detalhes: Record<string, unknown> | null
  criado_em: string
}

export function useVendaAuditoria(vendaId: number) {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    const { data, error } = await supabase
      .from('vendas_auditoria')
      .select('*')
      .eq('venda_id', vendaId)
      .order('criado_em', { ascending: false })

    setCarregando(false)

    if (error) {
      setErro(error.message)
      return
    }

    setRegistros((data as RegistroAuditoria[]) || [])
  }, [vendaId])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { registros, carregando, erro, recarregar: carregar }
}
