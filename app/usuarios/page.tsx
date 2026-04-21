'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { USUARIO_SELECT, mapUsuario } from '@/lib/auth'
import type { Usuario } from '@/lib/auth'
import { useAuthContext } from '@/contexts/AuthContext'
import { MODULOS } from '@/lib/permissoes'

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

type Departamento = { id: number; nome: string }
type Cargo        = { id: number; departamento_id: number; nome: string }
type Funcao       = { id: number; cargo_id: number; nome: string }

type FormData = {
  nome:             string
  email:            string
  ativo:            boolean
  observacao:       string
  departamento_id:  number | ''
  cargo_id:         number | ''
  funcao_id:        number | ''
}

const FORM_VAZIO: FormData = {
  nome:            '',
  email:           '',
  ativo:           true,
  observacao:      '',
  departamento_id: '',
  cargo_id:        '',
  funcao_id:       '',
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type ModalProps = {
  usuario:       Usuario | null
  departamentos: Departamento[]
  cargos:        Cargo[]
  funcoes:       Funcao[]
  onClose:       () => void
  onSalvo:       () => void
}

function UsuarioModal({ usuario, departamentos, cargos, funcoes, onClose, onSalvo }: ModalProps) {
  const [form, setForm]         = useState<FormData>(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState<string | null>(null)

  // Preenche o form ao editar
  useEffect(() => {
    if (usuario) {
      setForm({
        nome:            usuario.nome,
        email:           usuario.email,
        ativo:           usuario.ativo ?? true,
        observacao:      usuario.observacao ?? '',
        departamento_id: usuario.departamento_id ?? '',
        cargo_id:        usuario.cargo_id ?? '',
        funcao_id:       usuario.funcao_id ?? '',
      })
    } else {
      setForm(FORM_VAZIO)
    }
  }, [usuario])

  // Selects filtrados por hierarquia
  const cargosFiltrados  = form.departamento_id !== '' ? cargos.filter(c  => c.departamento_id === form.departamento_id) : []
  const funcoesFiltradas = form.cargo_id        !== '' ? funcoes.filter(f => f.cargo_id        === form.cargo_id)        : []

  // Garante que o item vinculado ao usuário em edição apareça mesmo se estiver inativo
  const depsEfetivos: Departamento[] = (() => {
    if (!usuario?.departamento_id || departamentos.some(d => d.id === usuario.departamento_id)) return departamentos
    return [...departamentos, { id: usuario.departamento_id, nome: (usuario.departamento ?? 'Departamento inativo') + ' ⚠' }]
  })()

  const cargosEfetivos: Cargo[] = (() => {
    if (!usuario?.cargo_id || cargosFiltrados.some(c => c.id === usuario.cargo_id)) return cargosFiltrados
    if (form.departamento_id !== usuario.departamento_id) return cargosFiltrados
    return [...cargosFiltrados, { id: usuario.cargo_id, departamento_id: form.departamento_id as number, nome: (usuario.cargo ?? 'Cargo inativo') + ' ⚠' }]
  })()

  const funcoesEfetivas: Funcao[] = (() => {
    if (!usuario?.funcao_id || funcoesFiltradas.some(f => f.id === usuario.funcao_id)) return funcoesFiltradas
    if (form.cargo_id !== usuario.cargo_id) return funcoesFiltradas
    return [...funcoesFiltradas, { id: usuario.funcao_id, cargo_id: form.cargo_id as number, nome: (usuario.funcao ?? 'Função inativa') + ' ⚠' }]
  })()

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function onDepartamentoChange(id: number | '') {
    setForm(prev => ({ ...prev, departamento_id: id, cargo_id: '', funcao_id: '' }))
  }

  function onCargoChange(id: number | '') {
    setForm(prev => ({ ...prev, cargo_id: id, funcao_id: '' }))
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (!form.nome.trim() || !form.email.trim()) {
      setErro('Nome e email são obrigatórios.')
      return
    }

    // Resolve nomes para gravar nos campos texto (compatibilidade)
    const depNome = departamentos.find(d => d.id === form.departamento_id)?.nome ?? null
    const carNome = cargos.find(c => c.id === form.cargo_id)?.nome ?? null
    const funNome = funcoes.find(f => f.id === form.funcao_id)?.nome ?? null

    const payload = {
      nome:            form.nome.trim(),
      email:           form.email.trim(),
      ativo:           form.ativo,
      observacao:      form.observacao.trim() || null,
      departamento_id: form.departamento_id !== '' ? form.departamento_id : null,
      cargo_id:        form.cargo_id        !== '' ? form.cargo_id        : null,
      funcao_id:       form.funcao_id       !== '' ? form.funcao_id       : null,
      departamento:    depNome,
      cargo:           carNome,
      funcao:          funNome,
    }

    setSalvando(true)

    const { error } = usuario
      ? await supabase.from('usuarios').update(payload).eq('id', usuario.id)
      : await supabase.from('usuarios').insert(payload)

    setSalvando(false)

    if (error) {
      setErro('Erro ao salvar: ' + error.message)
      return
    }

    onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* Cabeçalho do modal */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-700">
            {usuario ? 'Editar usuário' : 'Novo usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Fechar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSalvar} className="space-y-4 px-6 py-5">

          {/* Nome */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Nome</label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30"
            />
          </div>

          {/* Departamento */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Departamento</label>
            <select
              value={form.departamento_id}
              onChange={e => onDepartamentoChange(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30"
            >
              <option value="">— Selecione —</option>
              {depsEfetivos.map(d => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          {/* Cargo (filtrado por departamento) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Cargo</label>
            <select
              value={form.cargo_id}
              onChange={e => onCargoChange(e.target.value ? Number(e.target.value) : '')}
              disabled={form.departamento_id === ''}
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30 disabled:opacity-40"
            >
              <option value="">— Selecione —</option>
              {cargosEfetivos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Função (filtrada por cargo) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Função</label>
            <select
              value={form.funcao_id}
              onChange={e => set('funcao_id', e.target.value ? Number(e.target.value) : '')}
              disabled={form.cargo_id === ''}
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30 disabled:opacity-40"
            >
              <option value="">— Selecione —</option>
              {funcoesEfetivas.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          {/* Observação */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Observação</label>
            <textarea
              value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
              rows={2}
              placeholder="Opcional"
              className="w-full resize-none rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0891b2]/30"
            />
          </div>

          {/* Ativo */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={e => set('ativo', e.target.checked)}
              className="h-4 w-4 rounded accent-[#0891b2]"
            />
            <span className="text-sm text-slate-600">Usuário ativo</span>
          </label>

          {/* Erro */}
          {erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-bold text-white hover:bg-[#0e7490] disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const { carregando: authCarregando, podeAcessar } = useAuthContext()
  const [usuarios,      setUsuarios]      = useState<Usuario[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargos,        setCargos]        = useState<Cargo[]>([])
  const [funcoes,       setFuncoes]       = useState<Funcao[]>([])
  const [carregando,    setCarregando]    = useState(true)
  const [erro,          setErro]          = useState<string | null>(null)
  const [modalAberto,   setModalAberto]   = useState(false)
  const [usuarioEdit,   setUsuarioEdit]   = useState<Usuario | null>(null)
  const [togglingId,    setTogglingId]    = useState<number | null>(null)

  const carregarUsuarios = useCallback(async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select(USUARIO_SELECT)
      .order('nome')

    if (error) {
      setErro('Erro ao carregar usuários.')
    } else {
      setUsuarios((data ?? []).map(u => mapUsuario(u as Record<string, unknown>)))
      setErro(null)
    }
  }, [])

  useEffect(() => {
    async function inicializar() {
      setCarregando(true)

      const [resUsuarios, resDep, resCargos, resFuncoes] = await Promise.all([
        supabase.from('usuarios').select(USUARIO_SELECT).order('nome'),
        supabase.from('departamentos').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('cargos').select('id, departamento_id, nome').eq('ativo', true).order('nome'),
        supabase.from('funcoes').select('id, cargo_id, nome').eq('ativo', true).order('nome'),
      ])

      if (resUsuarios.error) {
        setErro('Erro ao carregar usuários.')
      } else {
        setUsuarios((resUsuarios.data ?? []).map(u => mapUsuario(u as Record<string, unknown>)))
      }

      setDepartamentos((resDep.data ?? []) as Departamento[])
      setCargos((resCargos.data ?? []) as Cargo[])
      setFuncoes((resFuncoes.data ?? []) as Funcao[])
      setCarregando(false)
    }

    inicializar()
  }, [])

  function abrirNovo() {
    setUsuarioEdit(null)
    setModalAberto(true)
  }

  function abrirEditar(u: Usuario) {
    setUsuarioEdit(u)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setUsuarioEdit(null)
  }

  async function aoSalvar() {
    fecharModal()
    await carregarUsuarios()
  }

  async function toggleAtivo(u: Usuario) {
    setTogglingId(u.id)
    await supabase.from('usuarios').update({ ativo: !u.ativo }).eq('id', u.id)
    await carregarUsuarios()
    setTogglingId(null)
  }

  if (authCarregando) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f4]">
      <p className="text-sm text-slate-400">Carregando...</p>
    </div>
  )
  if (!podeAcessar(MODULOS.usuarios)) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f4]">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-base font-bold text-slate-700">Acesso não autorizado</p>
        <p className="mt-1 text-sm text-slate-400">Você não tem permissão para acessar esta página.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f4f4] p-6">

      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0891b2]">Usuários</h1>
          <p className="text-sm text-slate-500">Colaboradores com acesso ao sistema</p>
        </div>
        <button
          onClick={abrirNovo}
          className="rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0e7490]"
        >
          + Novo usuário
        </button>
      </div>

      {/* Carregando */}
      {carregando && (
        <p className="text-sm text-slate-400">Carregando...</p>
      )}

      {/* Erro */}
      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* Tabela */}
      {!carregando && !erro && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Nome</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Departamento</th>
                <th className="px-5 py-4">Cargo</th>
                <th className="px-5 py-4">Função</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{u.nome}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3 text-slate-600">{u.departamento_nome ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{u.cargo_nome ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{u.funcao_nome ?? '—'}</td>

                  {/* Toggle ativo */}
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleAtivo(u)}
                      disabled={togglingId === u.id}
                      title={u.ativo ? 'Clique para inativar' : 'Clique para ativar'}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50"
                      style={
                        u.ativo
                          ? { background: '#dcfce7', color: '#166534' }
                          : { background: '#f1f5f9', color: '#94a3b8' }
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: u.ativo ? '#22c55e' : '#cbd5e1' }}
                      />
                      {togglingId === u.id ? '...' : u.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>

                  {/* Ações */}
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => abrirEditar(u)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0891b2] hover:bg-[#0891b2]/10"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            {usuarios.length} {usuarios.length === 1 ? 'usuário' : 'usuários'} encontrado{usuarios.length === 1 ? '' : 's'}
            {' · '}
            {usuarios.filter(u => u.ativo).length} ativo{usuarios.filter(u => u.ativo).length === 1 ? '' : 's'}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <UsuarioModal
          usuario={usuarioEdit}
          departamentos={departamentos}
          cargos={cargos}
          funcoes={funcoes}
          onClose={fecharModal}
          onSalvo={aoSalvar}
        />
      )}
    </div>
  )
}
