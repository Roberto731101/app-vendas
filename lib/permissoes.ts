import { supabase } from '@/lib/supabase'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AcaoPermissao = {
  pode_ver: boolean
  pode_criar: boolean
  pode_editar: boolean
  pode_excluir: boolean
}

/**
 * Estrutura final:
 * {
 *   usuarios: { pode_ver: true, pode_criar: true, ... },
 *   cargos:   { ... }
 * }
 */
export type Permissoes = Record<string, AcaoPermissao>

// Shape interno do retorno do Supabase (join pode vir como objeto ou array)
type RawPermissao = {
  pode_ver: boolean | null
  pode_criar: boolean | null
  pode_editar: boolean | null
  pode_excluir: boolean | null
  modulos_sistema: { chave: string } | { chave: string }[] | null
}

// ─── Defaults ────────────────────────────────────────────────────────────────

function permissaoVazia(): AcaoPermissao {
  return {
    pode_ver: false,
    pode_criar: false,
    pode_editar: false,
    pode_excluir: false,
  }
}

// ─── Carregamento ─────────────────────────────────────────────────────────────

/**
 * Busca no banco todas as permissões vinculadas à função do usuário.
 * Retorna um objeto indexado pela chave do módulo.
 *
 * Tabelas necessárias:
 *   public.permissoes_funcao
 *   public.modulos_sistema
 */
export async function carregarPermissoes(funcaoId: number): Promise<Permissoes> {
  console.log('[permissoes] carregando para funcaoId:', funcaoId)

  const { data, error } = await supabase
    .from('permissoes_funcao')
    .select(`
      pode_ver,
      pode_criar,
      pode_editar,
      pode_excluir,
      modulos_sistema:modulo_id(chave)
    `)
    .eq('funcao_id', funcaoId)

  if (error) {
    console.error('[permissoes] erro ao carregar:', error.message)
    return {}
  }

  const permissoes: Permissoes = {}

  for (const item of (data ?? []) as RawPermissao[]) {
    const moduloRaw = item.modulos_sistema
    if (!moduloRaw) continue

    const modulo = Array.isArray(moduloRaw) ? moduloRaw[0] : moduloRaw
    const chave = modulo?.chave

    if (!chave) continue

    permissoes[chave] = {
      pode_ver: Boolean(item.pode_ver),
      pode_criar: Boolean(item.pode_criar),
      pode_editar: Boolean(item.pode_editar),
      pode_excluir: Boolean(item.pode_excluir),
    }
  }

  console.log('[permissoes] permissões carregadas:', permissoes)
  return permissoes
}

// ─── Verificações ─────────────────────────────────────────────────────────────

export function checarPermissao(permissoes: Permissoes | null, modulo: string): boolean {
  if (permissoes === null) return false
  return Boolean(permissoes[modulo]?.pode_ver)
}

export function checarPermissaoCriar(permissoes: Permissoes | null, modulo: string): boolean {
  if (permissoes === null) return false
  return Boolean(permissoes[modulo]?.pode_criar)
}

export function checarPermissaoEditar(permissoes: Permissoes | null, modulo: string): boolean {
  if (permissoes === null) return false
  return Boolean(permissoes[modulo]?.pode_editar)
}

export function checarPermissaoExcluir(permissoes: Permissoes | null, modulo: string): boolean {
  if (permissoes === null) return false
  return Boolean(permissoes[modulo]?.pode_excluir)
}

export function obterPermissaoModulo(
  permissoes: Permissoes | null,
  modulo: string
): AcaoPermissao {
  if (permissoes === null) return permissaoVazia()
  return permissoes[modulo] ?? permissaoVazia()
}

// ─── Chaves de módulo do sistema ─────────────────────────────────────────────

export const MODULOS = {
  dashboard: 'dashboard',
  vendas: 'vendas',
  colheita: 'colheita',
  relatorios: 'relatorios',
  estoque: 'estoque',
  areas: 'areas',
  pdca: 'pdca',
  tecnica: 'tecnica',
  fazendas: 'fazendas',
  setores: 'setores',
  produtos: 'produtos',
  tipos_caixa: 'tipos_caixa',
  classificacoes: 'classificacoes',
  departamentos: 'departamentos',
  cargos: 'cargos',
  funcoes: 'funcoes',
  usuarios: 'usuarios',
} as const

export type ModuloChave = (typeof MODULOS)[keyof typeof MODULOS]