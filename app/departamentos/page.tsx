'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Departamento = {
  id:         number
  nome:       string
  descricao:  string | null
  ativo:      boolean
  created_at: string
}

type FormDep = {
  nome:      string
  descricao: string
  ativo:     boolean
}

const FORM_VAZIO: FormDep = { nome: '', descricao: '', ativo: true }

// ─── Regra de integridade (módulo) ───────────────────────────────────────────
// Centralizada fora dos componentes para ser usada pelo modal E pelo toggle.

type ResultadoVerificacao =
  | { permitido: true }
  | { permitido: false; motivo: string }

async function podeInativarDepartamento(id: number): Promise<ResultadoVerificacao> {
  console.log('[podeInativarDepartamento] verificando depId:', id)

  const { data, error } = await supabase
    .from('cargos')
    .select('id')
    .eq('departamento_id', id)
    .eq('ativo', true)
    .limit(1)

  if (error) {
    console.log('[podeInativarDepartamento] BLOQUEADO — erro na consulta:', error.message)
    return { permitido: false, motivo: 'Não foi possível verificar os cargos vinculados. Tente novamente.' }
  }

  const qtd = data?.length ?? 0
  console.log('[podeInativarDepartamento] cargos ativos encontrados:', qtd, '| permitido:', qtd === 0)

  if (qtd > 0) {
    return {
      permitido: false,
      motivo:    `Este departamento possui ${qtd} cargo(s) ativo(s) vinculado(s) e não pode ser inativado. Inative os cargos primeiro.`,
    }
  }

  return { permitido: true }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type ModalProps = {
  item:    Departamento | null
  onClose: () => void
  onSalvo: () => void
}

function DepModal({ item, onClose, onSalvo }: ModalProps) {
  const [form, setForm]         = useState<FormDep>(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState<string | null>(null)

  useEffect(() => {
    setForm(item
      ? { nome: item.nome, descricao: item.descricao ?? '', ativo: item.ativo }
      : FORM_VAZIO
    )
    setErro(null)
  }, [item])

  function set<K extends keyof FormDep>(key: K, value: FormDep[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    const nome = form.nome.trim()
    if (!nome) { setErro('Nome é obrigatório.'); return }

    // Verificar duplicidade de nome
    let q = supabase.from('departamentos').select('id').eq('nome', nome)
    if (item) q = q.neq('id', item.id)
    const { data: dup } = await q
    if (dup && dup.length > 0) { setErro('Já existe um departamento com este nome.'); return }

    // ── Bloquear inativação com cargos ativos ────────────────────────────────
    // Condição: edição de registro ativo sendo marcado como inativo
    const estaInativando = item !== null && item.ativo === true && form.ativo === false
    if (estaInativando) {
      setSalvando(true)
      const resultado = await podeInativarDepartamento(item.id)
      setSalvando(false)

      if (!resultado.permitido) {
        setErro(resultado.motivo)
        return   // modal permanece aberto, dados preservados
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const payload = { nome, descricao: form.descricao.trim() || null, ativo: form.ativo }
    setSalvando(true)

    const { error } = item
      ? await supabase.from('departamentos').update(payload).eq('id', item.id)
      : await supabase.from('departamentos').insert(payload)

    setSalvando(false)
    if (error) { setErro('Erro ao salvar: ' + error.message); return }
    onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-700">
            {item ? 'Editar departamento' : 'Novo departamento'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4 px-6 py-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Nome *</label>
            <input
              type="text" required value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Operações, Administrativo..."
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
            <span className="text-sm text-slate-600">Departamento ativo</span>
          </label>

          {erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
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

export default function DepartamentosPage() {
  const [lista,       setLista]       = useState<Departamento[]>([])
  const [carregando,  setCarregando]  = useState(true)
  const [erro,        setErro]        = useState<string | null>(null)
  const [aviso,       setAviso]       = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [itemEdit,    setItemEdit]    = useState<Departamento | null>(null)
  const [togglingId,  setTogglingId]  = useState<number | null>(null)

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from('departamentos').select('id, nome, descricao, ativo, created_at').order('nome')
    if (error) setErro('Erro ao carregar departamentos.')
    else { setLista((data ?? []) as Departamento[]); setErro(null) }
  }, [])

  useEffect(() => {
    setCarregando(true)
    carregar().finally(() => setCarregando(false))
  }, [carregar])

  function abrirNovo()                    { setItemEdit(null); setModalAberto(true); setAviso(null) }
  function abrirEditar(d: Departamento)   { setItemEdit(d);    setModalAberto(true); setAviso(null) }
  function fecharModal()                  { setModalAberto(false); setItemEdit(null) }
  async function aoSalvar()               { fecharModal(); await carregar() }

  async function toggleAtivo(dep: Departamento) {
    setAviso(null)

    // Reativação: sem restrição
    if (!dep.ativo) {
      setTogglingId(dep.id)
      await supabase.from('departamentos').update({ ativo: true }).eq('id', dep.id)
      await carregar()
      setTogglingId(null)
      return
    }

    // Inativação: mesma função centralizada usada pelo modal
    setTogglingId(dep.id)
    const resultado = await podeInativarDepartamento(dep.id)
    setTogglingId(null)

    if (!resultado.permitido) {
      setAviso(resultado.motivo)
      return
    }

    setTogglingId(dep.id)
    await supabase.from('departamentos').update({ ativo: false }).eq('id', dep.id)
    await carregar()
    setTogglingId(null)
  }

  const ativos   = lista.filter(d => d.ativo).length
  const inativos = lista.length - ativos

  return (
    <div className="min-h-screen bg-[#f0f4f4] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0891b2]">Departamentos</h1>
          <p className="text-sm text-slate-500">Estrutura organizacional — nível 1</p>
        </div>
        <button
          onClick={abrirNovo}
          className="rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0e7490]"
        >+ Novo departamento</button>
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
                <th className="px-5 py-4">Descrição</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lista.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Nenhum departamento cadastrado.</td></tr>
              )}
              {lista.map(dep => (
                <tr key={dep.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{dep.nome}</td>
                  <td className="px-5 py-3 text-slate-500">{dep.descricao ?? '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleAtivo(dep)}
                      disabled={togglingId === dep.id}
                      title={dep.ativo ? 'Clique para inativar' : 'Clique para ativar'}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50"
                      style={dep.ativo
                        ? { background: '#dcfce7', color: '#166534' }
                        : { background: '#f1f5f9', color: '#94a3b8' }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full"
                        style={{ background: dep.ativo ? '#22c55e' : '#cbd5e1' }} />
                      {togglingId === dep.id ? '...' : dep.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => abrirEditar(dep)}
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
        <DepModal item={itemEdit} onClose={fecharModal} onSalvo={aoSalvar} />
      )}
    </div>
  )
}
