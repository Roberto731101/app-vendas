import { supabase } from '@/lib/supabase'

export type Usuario = {
  id: number
  nome: string
  email: string
  cargo: string | null
  funcao: string | null
  departamento: string | null
  auth_id: string
  created_at: string
}

export function signIn(email: string, senha: string) {
  return supabase.auth.signInWithPassword({ email, password: senha })
}

export function signOut() {
  return supabase.auth.signOut()
}

export function getSession() {
  return supabase.auth.getSession()
}

export async function getUser(): Promise<Usuario | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', session.user.id)
    .single()

  if (error || !data) return null
  return data as Usuario
}
