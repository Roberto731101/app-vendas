'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Usuario } from '@/lib/auth'
import { USUARIO_SELECT, mapUsuario } from '@/lib/auth'
import { carregarPermissoes, checarPermissao } from '@/lib/permissoes'
import type { Permissoes } from '@/lib/permissoes'

export function useAuth() {
  const [user,        setUser]        = useState<Usuario | null>(null)
  const [session,     setSession]     = useState<Session | null>(null)
  const [permissoes,  setPermissoes]  = useState<Permissoes | null>(null)
  const [carregando,  setCarregando]  = useState(true)

  async function carregarPerfil(authUserId: string) {
    // 1. Busca perfil com JOIN de departamento/cargo/funcao
    const { data } = await supabase
      .from('usuarios')
      .select(USUARIO_SELECT)
      .eq('auth_id', authUserId)
      .single()

    const usuario = data ? mapUsuario(data as Record<string, unknown>) : null

    // 2. Carrega permissões antes de sinalizar carregamento concluído
    //    → garante que podeAcessar() já funciona quando carregando = false
    if (usuario?.funcao_id) {
      const perms = await carregarPermissoes(usuario.funcao_id)
      setPermissoes(perms)
    } else {
      // Usuário sem função → sem permissões explícitas
      setPermissoes(new Set())
    }

    setUser(usuario)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) carregarPerfil(session.user.id)
      else setCarregando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        carregarPerfil(session.user.id)
      } else {
        setUser(null)
        setPermissoes(null)
        setCarregando(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sinaliza carregamento concluído somente após user E permissoes estarem prontos
  useEffect(() => {
    if ((user !== null || session === null) && permissoes !== null) {
      setCarregando(false)
    }
  }, [user, session, permissoes])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setPermissoes(null)
  }

  // Função estável — só recriada quando permissoes muda
  const podeAcessar = useCallback(
    (modulo: string) => checarPermissao(permissoes, modulo),
    [permissoes]
  )

  return { user, session, carregando, logout, permissoes, podeAcessar }
}
