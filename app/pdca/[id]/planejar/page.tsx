'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePdcaCiclos } from '@/hooks/usePdcaCiclos'
import { usePdcaTarefas } from '@/hooks/usePdcaTarefas'
import { useFazendas } from '@/hooks/useFazendas'
import { useAreas } from '@/hooks/useAreas'
import { useSetores } from '@/hooks/useSetores'
import { supabase } from '@/lib/supabase'
import type { PdcaTarefaInsert, PdcaPrioridade } from '@/types/pdca'
import { PdcaViewNav } from '@/components/pdca/PdcaViewNav'

// ── Tipos locais ──────────────────────────────────────────────────────────────

type Cargo = { id: number; nome: string; departamento_nome: string | null }

// ── Constantes ────────────────────────────────────────────────────────────────

const PRIORIDADE_LABEL: Record<PdcaPrioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta:  'Alta',
}

const PRIORIDADE_COR: Record<PdcaPrioridade, string> = {
  baixa: 'bg-slate-100 text-slate-600',
  media: 'bg-amber-100 text-amber-700',
  alta:  'bg-red-100 text-red-700',
}

const FORM_VAZIO: Omit<PdcaTarefaInsert, 'ciclo_id'> = {
  titulo:               '',
  descricao:            null,
  cargo_id:             0,
  executor_id:          null,
  status:               'a_fazer',
  prioridade:           'media',
  prazo:                null,
  data_inicio_prevista: null,
  data_fim_prevista:    null,
  ordem:                0,
  fazenda_id:           null,
  area_id:              null,
  setor_id:             null,
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function PlanejarPage() {
  const params  = useParams()
  const router  = useRouter()
  const cicloId = Number(params.id)

  const { registros: ciclos, carregando: carregandoCiclo } = usePdcaCiclos()
  const tarefaHook = usePdcaTarefas(cicloId)
  const fazHook    = useFazendas()
  const areaHook   = useAreas()
  const setorHook  = useSetores()

  const ciclo = ciclos.find((c) => c.id === cicloId) ?? null

  // Seleção de localização em cascata
  const [fazendaId, setFazendaId] = useState('')
  const [areaId,    setAreaId]    = useState('')
  const [setorId,   setSetorId]   = useState('')

  const areasFiltradas   = areaHook.registros.filter((a) => String(a.fazenda_id) === fazendaId)
  const setoresFiltrados = setorHook.registros.filter((s) => String(s.area_id) === areaId)

  useEffect(() => { setAreaId(''); setSetorId('') }, [fazendaId])
  useEffect(() => { setSetorId('') }, [areaId])

  // Cargos — consulta direta (sem hook próprio)
  const [cargos, setCargos] = useState<Cargo[]>([])
  useEffect(() => {
    supabase
      .from('cargos')
      .select('id, nome, departamentos:departamento_id (nome)')
      .eq('ativo', true)
      .order('nome', { ascending: true })
      .then(({ data }) => {
        setCargos(
          ((data ?? []) as Record<string, unknown>[]).map((r) => {
            const dep = r['departamentos'] as { nome: string } | null
            return {
              id:               Number(r['id']),
              nome:             String(r['nome'] ?? ''),
              departamento_nome: dep?.nome ?? null,
            }
          })
        )
      })
  }, [])

  // Formulário
  const [form, setForm]           = useState<Omit<PdcaTarefaInsert, 'ciclo_id'>>(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erroForm, setErroForm]   = useState<string | null>(null)

  function abrirNovasTarefa() {
    setForm(FORM_VAZIO)
    setFazendaId('')
    setAreaId('')
    setSetorId('')
    setEditandoId(null)
    setErroForm(null)
    setMostrarForm(true)
  }

  function abrirEdicao(id: number) {
    const t = tarefaHook.registros.find((t) => t.id === id)
    if (!t) return
    setForm({
      titulo:               t.titulo,
      descricao:            t.descricao,
      cargo_id:             t.cargo_id,
      executor_id:          null,
      status:               t.status,
      prioridade:           t.prioridade,
      prazo:                t.prazo,
      data_inicio_prevista: t.data_inicio_prevista,
      data_fim_prevista:    t.data_fim_prevista,
      ordem:                t.ordem,
      fazenda_id:           t.fazenda_id,
      area_id:              t.area_id,
      setor_id:             t.setor_id,
    })
    setFazendaId(t.fazenda_id ? String(t.fazenda_id) : '')
    setAreaId(t.area_id ? String(t.area_id) : '')
    setSetorId(t.setor_id ? String(t.setor_id) : '')
    setEditandoId(id)
    setErroForm(null)
    setMostrarForm(true)
  }

  function fecharForm() {
    setMostrarForm(false)
    setEditandoId(null)
    setForm(FORM_VAZIO)
    setErroForm(null)
  }

  async function handleSalvar() {
    if (!form.titulo.trim()) { setErroForm('O título é obrigatório.'); return }
    if (!form.cargo_id)      { setErroForm('O cargo responsável é obrigatório.'); return }

    const payload: PdcaTarefaInsert = {
      ...form,
      ciclo_id:   cicloId,
      fazenda_id: fazendaId ? Number(fazendaId) : null,
      area_id:    areaId    ? Number(areaId)    : null,
      setor_id:   setorId   ? Number(setorId)   : null,
    }

    const ok = await tarefaHook.salvar(payload, editandoId ?? undefined)
    if (ok) fecharForm()
    else setErroForm(tarefaHook.erro ?? 'Erro ao salvar.')
  }

  // ── Loading / not found ────────────────────────────────────────────────────
  if (carregandoCiclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Planejamento', active: true }]}>
        <div className="flex items-center justify-center py-24 text-sm text-slate-400">Carregando...</div>
      </AppLayout>
    )
  }

  if (!ciclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Planejamento', active: true }]}>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-sm text-slate-500">Ciclo não encontrado.</p>
          <button onClick={() => router.push('/pdca')} className="text-sm text-[#0891b2] hover:underline">← Voltar</button>
        </div>
      </AppLayout>
    )
  }

  const NAV_HEADER = [
    { label: 'Operacional' },
    { label: 'PDCA', href: '/pdca' },
    { label: ciclo.titulo, href: `/pdca/${cicloId}` },
    { label: 'Planejar', active: true },
  ]

  return (
    <AppLayout headerNavItems={NAV_HEADER}>

      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-xs text-slate-400">
            <button onClick={() => router.push('/pdca')} className="hover:text-[#0891b2]">PDCA</button>
            <span>/</span>
            <button onClick={() => router.push(`/pdca/${cicloId}`)} className="hover:text-[#0891b2]">{ciclo.titulo}</button>
            <span>/</span>
            <span className="text-slate-600">Planejar</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Planejamento</h1>
          <p className="mt-1 text-sm text-slate-500">
            Defina e delegue as tarefas do ciclo <span className="font-medium text-slate-700">{ciclo.titulo}</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <PdcaViewNav cicloId={cicloId} ativa="planejar" />
          <button
            onClick={abrirNovasTarefa}
            className="rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490]"
          >
            + Nova Tarefa
          </button>
        </div>
      </div>

      {/* Feedback global */}
      {tarefaHook.erro     && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{tarefaHook.erro}</div>}
      {tarefaHook.mensagem && <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{tarefaHook.mensagem}</div>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            {editandoId ? 'Editar tarefa' : 'Nova tarefa'}
          </h2>

          {erroForm && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{erroForm}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Título */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Inspeção de equipamentos de irrigação"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
            </div>

            {/* Cargo responsável */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Cargo responsável <span className="text-red-500">*</span>
              </label>
              <select
                value={form.cargo_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, cargo_id: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              >
                <option value="">Selecione o cargo...</option>
                {cargos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}{c.departamento_nome ? ` — ${c.departamento_nome}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Prioridade</label>
              <select
                value={form.prioridade}
                onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value as PdcaPrioridade }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              >
                {(Object.keys(PRIORIDADE_LABEL) as PdcaPrioridade[]).map((p) => (
                  <option key={p} value={p}>{PRIORIDADE_LABEL[p]}</option>
                ))}
              </select>
            </div>

            {/* Prazo */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Prazo</label>
              <input
                type="date"
                value={form.prazo ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value || null }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
            </div>

            {/* Período planejado (Gantt) */}
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Período planejado <span className="font-normal normal-case text-slate-400">(para o Gantt — opcional)</span>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Início previsto</label>
                  <input
                    type="date"
                    value={form.data_inicio_prevista ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, data_inicio_prevista: e.target.value || null }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Fim previsto</label>
                  <input
                    type="date"
                    value={form.data_fim_prevista ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, data_fim_prevista: e.target.value || null }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Descrição</label>
              <textarea
                rows={2}
                value={form.descricao ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value || null }))}
                placeholder="Detalhes da tarefa (opcional)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
            </div>

            {/* Localização — cascata */}
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Localização <span className="font-normal normal-case text-slate-400">(opcional)</span>
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Fazenda</label>
                  <select
                    value={fazendaId}
                    onChange={(e) => setFazendaId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                  >
                    <option value="">Todas</option>
                    {fazHook.registros.map((f) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Área</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    disabled={!fazendaId}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Todas</option>
                    {areasFiltradas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Setor</label>
                  <select
                    value={setorId}
                    onChange={(e) => setSetorId(e.target.value)}
                    disabled={!areaId}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Todos</option>
                    {setoresFiltrados.map((s) => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={handleSalvar}
              disabled={tarefaHook.salvando}
              className="rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0e7490] disabled:opacity-50"
            >
              {tarefaHook.salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Criar tarefa'}
            </button>
            <button
              onClick={fecharForm}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de tarefas */}
      {tarefaHook.carregando ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          Carregando tarefas...
        </div>
      ) : tarefaHook.registros.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <span className="text-4xl">📋</span>
          <p className="mt-4 text-sm font-medium text-slate-700">Nenhuma tarefa planejada ainda</p>
          <p className="mt-1 text-xs text-slate-400">Crie a primeira tarefa para começar o planejamento.</p>
          <button
            onClick={abrirNovasTarefa}
            className="mt-5 rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0e7490]"
          >
            + Nova Tarefa
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-12 gap-2 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="col-span-4">Tarefa</span>
            <span className="col-span-2">Cargo</span>
            <span className="col-span-2">Localização</span>
            <span className="col-span-1">Prazo</span>
            <span className="col-span-1">Prioridade</span>
            <span className="col-span-2 text-right">Ações</span>
          </div>

          {/* Linhas */}
          {tarefaHook.registros.map((tarefa, idx) => (
            <div
              key={tarefa.id}
              className={`grid grid-cols-12 items-center gap-2 px-5 py-4 text-sm transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              } hover:bg-[#0891b2]/5`}
            >
              {/* Título + descrição */}
              <div className="col-span-4">
                <p className="font-medium text-slate-800 leading-snug">{tarefa.titulo}</p>
                {tarefa.descricao && (
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{tarefa.descricao}</p>
                )}
              </div>

              {/* Cargo */}
              <div className="col-span-2">
                <span className="inline-block max-w-full truncate rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700">
                  {tarefa.cargo_nome ?? '—'}
                </span>
              </div>

              {/* Localização */}
              <div className="col-span-2 text-xs text-slate-500">
                {tarefa.fazenda_nome
                  ? [tarefa.fazenda_nome, tarefa.area_nome, tarefa.setor_nome].filter(Boolean).join(' / ')
                  : <span className="text-slate-300">—</span>
                }
              </div>

              {/* Prazo */}
              <div className="col-span-1 text-xs text-slate-500">
                {tarefa.prazo
                  ? new Date(tarefa.prazo + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  : <span className="text-slate-300">—</span>
                }
              </div>

              {/* Prioridade */}
              <div className="col-span-1">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORIDADE_COR[tarefa.prioridade]}`}>
                  {PRIORIDADE_LABEL[tarefa.prioridade]}
                </span>
              </div>

              {/* Ações */}
              <div className="col-span-2 flex justify-end gap-1">
                <button
                  onClick={() => abrirEdicao(tarefa.id)}
                  className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => tarefaHook.excluir(tarefa.id)}
                  className="rounded-lg px-2.5 py-1 text-xs text-red-500 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}

          {/* Rodapé com resumo */}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            <span>{tarefaHook.registros.length} {tarefaHook.registros.length === 1 ? 'tarefa' : 'tarefas'} planejadas</span>
            <div className="flex gap-4">
              <span>Alta: <strong className="text-red-600">{tarefaHook.registros.filter((t) => t.prioridade === 'alta').length}</strong></span>
              <span>Média: <strong className="text-amber-600">{tarefaHook.registros.filter((t) => t.prioridade === 'media').length}</strong></span>
              <span>Baixa: <strong className="text-slate-600">{tarefaHook.registros.filter((t) => t.prioridade === 'baixa').length}</strong></span>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  )
}
