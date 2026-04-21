'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { MODULOS } from '@/lib/permissoes'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type CargoSimples = {
  id:              number
  nome:            string
  departamentos:   { nome: string } | null
}

type Funcao = {
  id:         number
  cargo_id:   number | null
  nome:       string
  descricao:  string | null
  ativo:      boolean
  created_at: string
  cargos:     { id: number; nome: string; departamentos: { nome: string } | null } | null
}

type FormFuncao = {
  cargo_id:  number | ''
  nome:      string
  descricao: string
  ativo:     boolean
}

const FORM_VAZIO: FormFuncao = { cargo_id: '', nome: '', descricao: '', ativo: true }

// ─── Normalização do retorno do Supabase ─────────────────────────────────────
// PostgREST pode retornar joins como array ou objeto único.
// Normalizamos sempre para objeto único antes de salvar no estado.

type RawJoin<T> = T | T[] | null

function primeiroOuNull<T>(v: RawJoin<T>): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

type RawCargoJoin = { id: number; nome: string; departamentos: RawJoin<{ nome: string }> }

function normalizarCargoSimples(raw: Record<string, unknown>): CargoSimples {
  return {
    id:            raw.id as number,
    nome:          raw.nome as string,
    departamentos: primeiroOuNull(raw.departamentos as RawJoin<{ nome: string }>),
  }
}

function normalizarFuncao(raw: Record<string, unknown>): Funcao {
  const cargoRaw = primeiroOuNull(raw.cargos as RawJoin<RawCargoJoin>)
  return {
    id:         raw.id as number,
    cargo_id:   raw.cargo_id as number | null,
    nome:       raw.nome as string,
    descricao:  raw.descricao as string | null,
    ativo:      raw.ativo as boolean,
    created_at: raw.created_at as string,
    cargos:     cargoRaw
      ? { id: cargoRaw.id, nome: cargoRaw.nome, departamentos: primeiroOuNull(cargoRaw.departamentos) }
      : null,
  }
}

// ─── Regra de integridade (módulo) ───────────────────────────────────────────

type ResultadoVerificacao =
  | { pode: true }
  | { pode: false; motivo: string }

async function podeInativarFuncao(id: number): Promise<ResultadoVerificacao> {
  console.log('[podeInativarFuncao] verificando funcaoId:', id)

  const { data, error } = await supabase
    .from('usuarios')
    .select('id')
    .eq('funcao_id', id)
    .limit(1)

  if (error) {
    console.log('[podeInativarFuncao] BLOQUEADO — erro na consulta:', error.message)
    return { pode: false, motivo: 'Não foi possível verificar os usuários vinculados. Tente novamente.' }
  }

  const qtdUsuarios = data?.length ?? 0
  console.log('[podeInativarFuncao] usuarios vinculados encontrados:', qtdUsuarios, '| permitido:', qtdUsuarios === 0)

  if (qtdUsuarios > 0) {
    console.log('[podeInativarFuncao] BLOQUEADO por usuarios vinculados')
    return {
      pode:   false,
      motivo: `Esta função possui ${qtdUsuarios} usuário(s) vinculado(s) e não pode ser inativada. Desvincule os usuários primeiro.`,
    }
  }

  console.log('[podeInativarFuncao] PERMITIDO')
  return { pode: true }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type ModalProps = {
  item:    Funcao | null
  cargos:  CargoSimples[]
  onClose: () => void
  onSalvo: () => void
}

function FuncaoModal({ item, cargos, onClose, onSalvo }: ModalProps) {
  const [form, setForm]         = useState<FormFuncao>(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState<string | null>(null)

  useEffect(() => {
    setForm(item
      ? { cargo_id: item.cargo_id ?? '', nome: item.nome, descricao: item.descricao ?? '', ativo: item.ativo }
      : FORM_VAZIO
    )
    setErro(null)
  }, [item])

  function set<K extends keyof FormFuncao>(key: K, value: FormFuncao[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Garante que o cargo vinculado apareça mesmo se inativo
  const cargosParaSelect: CargoSimples[] = (() => {
    if (!item?.cargo_id) return cargos
    if (cargos.some(c => c.id === item.cargo_id)) return cargos
    return [...cargos, {
      id:            item.cargo_id,
      nome:          (item.cargos?.nome ?? 'Cargo inativo') + ' ⚠',
      departamentos: item.cargos?.departamentos ?? null,
    }]
  })()

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (form.cargo_id === '') { setErro('Cargo é obrigatório.'); return }
    const nome = form.nome.trim()
    if (!nome) { setErro('Nome é obrigatório.'); return }

    // Verificar duplicidade no mesmo cargo
    let q = supabase.from('funcoes').select('id')
      .eq('nome', nome).eq('cargo_id', form.cargo_id)
    if (item) q = q.neq('id', item.id)
    const { data: dup } = await q
    if (dup && dup.length > 0) { setErro('Já existe uma função com este nome neste cargo.'); return }

    // ── Bloquear inativação com usuários vinculados ──────────────────────────
    const estaInativando = item !== null && item.ativo === true && form.ativo === false
    if (estaInativando) {
      setSalvando(true)
      const resultado = await podeInativarFuncao(item.id)
      setSalvando(false)

      if (!resultado.pode) {
        setErro(resultado.motivo)
        return   // modal permanece aberto, dados preservados
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const payload = {
      cargo_id:  form.cargo_id,
      nome,
      descricao: form.descricao.trim() || null,
      ativo:     form.ativo,
    }

    setSalvando(true)
    const { error } = item
      ? await supabase.from('funcoes').update(payload).eq('id', item.id)
      : await supabase.from('funcoes').insert(payload)
    setSalvando(false)

    if (error) { setErro('Erro ao salvar: ' + error.message); return }
    onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-700">
            {item ? 'Editar função' : 'Nova função'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4 px-6 py-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Cargo *</label>
            <select
              value={form.cargo_id}
              onChange={e => set('cargo_id', e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30"
            >
              <option value="">— Selecione —</option>
              {cargosParaSelect.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}{c.departamentos ? ` (${c.departamentos.nome})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Nome *</label>
            <input
              type="text" required value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Técnico de Campo, Assistente..."
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Descrição</label>
            <textarea
              value={form.descricao} rows={2}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Opcional"
              className="w-full resize-none rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox" checked={form.ativo}
              onChange={e => set('ativo', e.target.checked)}
              className="h-4 w-4 rounded accent-[#0891b2]"
            />
            <span className="text-sm text-slate-600">Função ativa</span>
          </label>

          {erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >Cancelar</button>
            <button
              type="submit" disabled={salvando}
              className="rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-bold text-white hover:bg-[#0e7490] disabled:opacity-50"
            >{salvando ? 'Verificando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FuncoesPage() {
  const { carregando: authCarregando, podeAcessar } = useAuthContext()
  const [lista,       setLista]       = useState<Funcao[]>([])
  const [cargos,      setCargos]      = useState<CargoSimples[]>([])
  const [carregando,  setCarregando]  = useState(true)
  const [erro,        setErro]        = useState<string | null>(null)
  const [aviso,       setAviso]       = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [itemEdit,    setItemEdit]    = useState<Funcao | null>(null)
  const [togglingId,  setTogglingId]  = useState<number | null>(null)

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from('funcoes')
      .select('id, cargo_id, nome, descricao, ativo, created_at, cargos:cargo_id(id, nome, departamentos:departamento_id(nome))')
      .order('nome')
    if (error) setErro('Erro ao carregar funções.')
    else { setLista((data ?? []).map(d => normalizarFuncao(d as Record<string, unknown>))); setErro(null) }
  }, [])

  useEffect(() => {
    async function inicializar() {
      setCarregando(true)
      const [, resCargos] = await Promise.all([
        carregar(),
        supabase
          .from('cargos')
          .select('id, nome, departamentos:departamento_id(nome)')
          .eq('ativo', true)
          .order('nome'),
      ])
      setCargos((resCargos.data ?? []).map(d => normalizarCargoSimples(d as Record<string, unknown>)))
      setCarregando(false)
    }
    inicializar()
  }, [carregar])

  function abrirNovo()            { setItemEdit(null);  setModalAberto(true); setAviso(null) }
  function abrirEditar(f: Funcao) { setItemEdit(f);     setModalAberto(true); setAviso(null) }
  function fecharModal()          { setModalAberto(false); setItemEdit(null) }
  async function aoSalvar()       { fecharModal(); await carregar() }

  async function toggleAtivo(funcao: Funcao) {
    setAviso(null)

    // Reativação: sem restrição
    if (!funcao.ativo) {
      setTogglingId(funcao.id)
      await supabase.from('funcoes').update({ ativo: true }).eq('id', funcao.id)
      await carregar()
      setTogglingId(null)
      return
    }

    // Inativação: mesma função centralizada usada pelo modal
    setTogglingId(funcao.id)
    const resultado = await podeInativarFuncao(funcao.id)
    setTogglingId(null)

    if (!resultado.pode) {
      setAviso(resultado.motivo)
      return
    }

    setTogglingId(funcao.id)
    await supabase.from('funcoes').update({ ativo: false }).eq('id', funcao.id)
    await carregar()
    setTogglingId(null)
  }

  const ativos   = lista.filter(f => f.ativo).length
  const inativos = lista.length - ativos

  if (authCarregando) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f4]">
      <p className="text-sm text-slate-400">Carregando...</p>
    </div>
  )
  if (!podeAcessar(MODULOS.funcoes)) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f4]">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-base font-bold text-slate-700">Acesso não autorizado</p>
        <p className="mt-1 text-sm text-slate-400">Você não tem permissão para acessar esta página.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f4f4] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0891b2]">Funções</h1>
          <p className="text-sm text-slate-500">Estrutura organizacional — nível 3</p>
        </div>
        <button
          onClick={abrirNovo}
          className="rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0e7490]"
        >+ Nova função</button>
      </div>

      {carregando && <p className="text-sm text-slate-400">Carregando...</p>}

      {erro && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
      )}

      {aviso && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠ {aviso}
          <button onClick={() => setAviso(null)} className="ml-3 text-amber-600 underline">Fechar</button>
        </div>
      )}

      {!carregando && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Nome</th>
                <th className="px-5 py-4">Cargo</th>
                <th className="px-5 py-4">Departamento</th>
                <th className="px-5 py-4">Descrição</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lista.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Nenhuma função cadastrada.</td></tr>
              )}
              {lista.map(funcao => (
                <tr key={funcao.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{funcao.nome}</td>
                  <td className="px-5 py-3 text-slate-600">{funcao.cargos?.nome ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{funcao.cargos?.departamentos?.nome ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{funcao.descricao ?? '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleAtivo(funcao)}
                      disabled={togglingId === funcao.id}
                      title={funcao.ativo ? 'Clique para inativar' : 'Clique para ativar'}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50"
                      style={funcao.ativo
                        ? { background: '#dcfce7', color: '#166534' }
                        : { background: '#f1f5f9', color: '#94a3b8' }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full"
                        style={{ background: funcao.ativo ? '#22c55e' : '#cbd5e1' }} />
                      {togglingId === funcao.id ? '...' : funcao.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => abrirEditar(funcao)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0891b2] hover:bg-[#0891b2]/10"
                    >Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            {lista.length} registro(s) · {ativos} ativo(s) · {inativos} inativo(s)
          </div>
        </div>
      )}

      {modalAberto && (
        <FuncaoModal
          item={itemEdit}
          cargos={cargos}
          onClose={fecharModal}
          onSalvo={aoSalvar}
        />
      )}
    </div>
  )
}
