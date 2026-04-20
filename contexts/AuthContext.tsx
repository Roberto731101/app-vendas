'use client'

import { createContext, useContext } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Session } from '@supabase/supabase-js'
import type { Usuario } from '@/lib/auth'

type AuthContextType = {
  user: Usuario | null
  session: Session | null
  carregando: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  carregando: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
