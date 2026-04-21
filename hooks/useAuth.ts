'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Usuario } from '@/lib/auth'
import { USUARIO_SELECT, mapUsuario } from '@/lib/auth'
import {
  carregarPermissoes,
  checarPermissao,
  checarPermissaoCriar,
  checarPermissaoEditar,
  checarPermissaoExcluir,
} from '@/lib/permissoes'
import type { Permissoes } from '@/lib/permissoes'

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [permissoes, setPermissoes] = useState<Permissoes | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregarPerfil(authUserId: string) {
    const { data } = await supabase
      .from('usuarios')
      .select(USUARIO_SELECT)
      .eq('auth_id', authUserId)
      .single()

    const usuario = data ? mapUsuario(data as Record<string, unknown>) : null

    if (usuario?.funcao_id) {
      const perms = await carregarPermissoes(usuario.funcao_id)
      setPermissoes(perms)
    } else {
      // Usuário sem função → sem permissões explícitas
      setPermissoes({})
    }

    setUser(usuario)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)

      if (session) {
        carregarPerfil(session.user.id)
      } else {
        setUser(null)
        setPermissoes({})
        setCarregando(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session) {
        setCarregando(true)
        carregarPerfil(session.user.id)
      } else {
        setUser(null)
        setSession(null)
        setPermissoes({})
        setCarregando(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if ((user !== null || session === null) && permissoes !== null) {
      setCarregando(false)
    }
  }, [user, session, permissoes])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setPermissoes({})
  }

  const podeAcessar = useCallback(
    (modulo: string) => checarPermissao(permissoes, modulo),
    [permissoes]
  )

  const podeCriar = useCallback(
    (modulo: string) => checarPermissaoCriar(permissoes, modulo),
    [permissoes]
  )

  const podeEditar = useCallback(
    (modulo: string) => checarPermissaoEditar(permissoes, modulo),
    [permissoes]
  )

  const podeExcluir = useCallback(
    (modulo: string) => checarPermissaoExcluir(permissoes, modulo),
    [permissoes]
  )

  return {
    user,
    session,
    carregando,
    logout,
    permissoes,
    podeAcessar,
    podeCriar,
    podeEditar,
    podeExcluir,
  }
}