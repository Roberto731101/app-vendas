'use client'

import { createContext, useContext } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Session } from '@supabase/supabase-js'
import type { Usuario } from '@/lib/auth'
import type { Permissoes } from '@/lib/permissoes'

type AuthContextType = {
  user: Usuario | null
  session: Session | null
  carregando: boolean
  logout: () => Promise<void>

  permissoes: Permissoes | null

  // 🔐 Permissões
  podeAcessar: (modulo: string) => boolean
  podeCriar: (modulo: string) => boolean
  podeEditar: (modulo: string) => boolean
  podeExcluir: (modulo: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  carregando: true,
  logout: async () => {},

  permissoes: null,

  podeAcessar: () => false,
  podeCriar: () => false,
  podeEditar: () => false,
  podeExcluir: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}