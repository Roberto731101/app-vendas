import { supabase } from '@/lib/supabase'

type RelNome = { id: number; nome: string } | null

export type Usuario = {
  id: number
  nome: string
  email: string
  auth_id: string
  ativo: boolean | null
  observacao: string | null
  departamento_id: number | null
  cargo_id: number | null
  funcao_id: number | null
  departamentos: RelNome
  cargos: RelNome
  funcoes: RelNome
  // derivados — mantidos para compatibilidade com Sidebar e AppHeader
  departamento: string | null
  cargo: string | null
  funcao: string | null
  // aliases explícitos
  departamento_nome: string | null
  cargo_nome: string | null
  funcao_nome: string | null
  created_at: string
}

const USUARIO_SELECT = `
  id,
  nome,
  email,
  auth_id,
  ativo,
  observacao,
  departamento_id,
  cargo_id,
  funcao_id,
  departamentos:departamento_id ( id, nome ),
  cargos:cargo_id ( id, nome ),
  funcoes:funcao_id ( id, nome )
`

function mapUsuario(raw: Record<string, unknown>): Usuario {
  const dep = raw.departamentos as RelNome
  const car = raw.cargos as RelNome
  const fun = raw.funcoes as RelNome
  return {
    ...(raw as Omit<Usuario, 'departamento' | 'cargo' | 'funcao' | 'departamento_nome' | 'cargo_nome' | 'funcao_nome'>),
    departamentos: dep,
    cargos: car,
    funcoes: fun,
    departamento: dep?.nome ?? null,
    cargo: car?.nome ?? null,
    funcao: fun?.nome ?? null,
    departamento_nome: dep?.nome ?? null,
    cargo_nome: car?.nome ?? null,
    funcao_nome: fun?.nome ?? null,
  }
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
    .select(USUARIO_SELECT)
    .eq('auth_id', session.user.id)
    .single()

  if (error || !data) return null
  return mapUsuario(data as Record<string, unknown>)
}

export { USUARIO_SELECT, mapUsuario }
