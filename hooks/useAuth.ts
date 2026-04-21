'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Usuario } from '@/lib/auth'
import { USUARIO_SELECT, mapUsuario } from '@/lib/auth'

export function useAuth() {
  const [user, setUser]       = useState<Usuario | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregarPerfil(authUserId: string) {
    const { data } = await supabase
      .from('usuarios')
      .select(USUARIO_SELECT)
      .eq('auth_id', authUserId)
      .single()
    setUser(data ? mapUsuario(data as Record<string, unknown>) : null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) carregarPerfil(session.user.id)
      else setCarregando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) carregarPerfil(session.user.id)
      else { setUser(null); setCarregando(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user !== null || session === null) setCarregando(false)
  }, [user, session])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return { user, session, carregando, logout }
}
