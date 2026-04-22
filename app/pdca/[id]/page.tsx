'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePdcaCiclos } from '@/hooks/usePdcaCiclos'
import { usePdcaTarefas } from '@/hooks/usePdcaTarefas'
import { supabase } from '@/lib/supabase'
import type { PdcaFase, PdcaObjetivo } from '@/types/pdca'

// ── Metadados das fases ───────────────────────────────────────────────────────

type FaseMeta = {
  fase:    PdcaFase
  label:   string
  descricao: string
  href:    (id: number) => string
  cor:     string
  corBg:   string
  corBorda: string
}

const FASES: FaseMeta[] = [
  {
    fase:      'planejar',
    label:     'Planejar',
    descricao: 'Defina objetivos, delegue tarefas e estabeleça prazos.',
    href:      (id) => `/pdca/${id}/planejar`,
    cor:       'text-cyan-700',
    corBg:     'bg-cyan-50 hover:bg-cyan-100',
    corBorda:  'border-cyan-200',
  },
  {
    fase:      'executar',
    label:     'Executar',
    descricao: 'Acompanhe o andamento das tarefas no Kanban.',
    href:      (id) => `/pdca/${id}/executar`,
    cor:       'text-green-700',
    corBg:     'bg-green-50 hover:bg-green-100',
    corBorda:  'border-green-200',
  },
  {
    fase:      'verificar',
    label:     'Verificar',
    descricao: 'Analise resultados e compare com os objetivos.',
    href:      (id) => `/pdca/${id}/verificar`,
    cor:       'text-amber-700',
    corBg:     'bg-amber-50 hover:bg-amber-100',
    corBorda:  'border-amber-200',
  },
  {
    fase:      'agir',
    label:     'Agir',
    descricao: 'Registre ações corretivas e inicie o próximo ciclo.',
    href:      (id) => `/pdca/${id}/agir`,
    cor:       'text-violet-700',
    corBg:     'bg-violet-50 hover:bg-violet-100',
    corBorda:  'border-violet-200',
  },
]

const ORDEM_FASE: PdcaFase[] = ['planejar', 'executar', 'verificar', 'agir', 'concluido']

const PROXIMA_FASE: Partial<Record<PdcaFase, PdcaFase>> = {
  planejar:  'executar',
  executar:  'verificar',
  verificar: 'agir',
  agir:      'concluido',
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function PdcaCicloHubPage() {
  const params  = useParams()
  const router  = useRouter()
  const cicloId = Number(params.id)

  const { registros, carregando: carregandoCiclo, avancarFase, salvando, erro, mensagem } = usePdcaCiclos()
  const tarefaHook = usePdcaTarefas(cicloId)

  const [objetivos, setObjetivos] = useState<PdcaObjetivo[]>([])

  const ciclo = registros.find((c) => c.id === cicloId) ?? null

  // Carrega objetivos diretamente — hook próprio virá na tela Planejar
  useEffect(() => {
    if (!cicloId) return
    supabase
      .from('pdca_objetivos')
      .select('*')
      .eq('ciclo_id', cicloId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setObjetivos((data ?? []) as PdcaObjetivo[]))
  }, [cicloId])

  async function handleAvancarFase() {
    if (!ciclo) return
    const proxima = PROXIMA_FASE[ciclo.fase_atual]
    if (!proxima) return
    const ok = await avancarFase(cicloId, proxima)
    if (ok && proxima !== 'concluido') {
      router.push(`/pdca/${cicloId}/${proxima}`)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (carregandoCiclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'Operacional' }, { label: 'PDCA', href: '/pdca' }, { label: '...', active: true }]}>
        <div className="flex items-center justify-center py-24 text-sm text-slate-400">
          Carregando ciclo...
        </div>
      </AppLayout>
    )
  }

  // ── Não encontrado ─────────────────────────────────────────────────────────
  if (!ciclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'Operacional' }, { label: 'PDCA', href: '/pdca' }, { label: 'Não encontrado', active: true }]}>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-slate-500">Ciclo não encontrado.</p>
          <button onClick={() => router.push('/pdca')} className="mt-4 text-sm text-[#0891b2] hover:underline">
            ← Voltar para ciclos
          </button>
        </div>
      </AppLayout>
    )
  }

  const NAV_HEADER = [
    { label: 'Operacional' },
    { label: 'PDCA', href: '/pdca' },
    { label: ciclo.titulo, active: true },
  ]

  const faseAtualIdx  = ORDEM_FASE.indexOf(ciclo.fase_atual)
  const proxima       = PROXIMA_FASE[ciclo.fase_atual]
  const estaConcluido = ciclo.fase_atual === 'concluido'

  const totalTarefas  = tarefaHook.registros.length
  const concluidas    = tarefaHook.concluidas.length
  const progresso     = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0

  return (
    <AppLayout headerNavItems={NAV_HEADER}>

      {/* Breadcrumb + voltar */}
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        <button onClick={() => router.push('/pdca')} className="hover:text-[#0891b2]">PDCA</button>
        <span>/</span>
        <span className="text-slate-600">{ciclo.titulo}</span>
      </div>

      {/* Cabeçalho do ciclo */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{ciclo.titulo}</h1>
          {ciclo.descricao && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{ciclo.descricao}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {ciclo.data_inicio && (
              <span>Início: {new Date(ciclo.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            )}
            {ciclo.data_fim_prevista && (
              <span>Previsão: {new Date(ciclo.data_fim_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            )}
            {ciclo.criado_por_nome && <span>Criado por: {ciclo.criado_por_nome}</span>}
          </div>
        </div>

        {!estaConcluido && proxima && (
          <button
            onClick={handleAvancarFase}
            disabled={salvando}
            className="self-start rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490] disabled:opacity-50 sm:self-auto"
          >
            {salvando ? 'Avançando...' : `Avançar para ${proxima.charAt(0).toUpperCase() + proxima.slice(1)} →`}
          </button>
        )}
        {estaConcluido && (
          <span className="self-start rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500 sm:self-auto">
            Ciclo concluído
          </span>
        )}
      </div>

      {/* Feedback */}
      {erro     && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}
      {mensagem && <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{mensagem}</div>}

      {/* Barra de progresso das fases */}
      <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Progresso do ciclo</p>
        <div className="flex items-center gap-1">
          {ORDEM_FASE.filter((f) => f !== 'concluido').map((fase, idx) => {
            const meta      = FASES.find((m) => m.fase === fase)!
            const concluida = idx < faseAtualIdx
            const ativa     = fase === ciclo.fase_atual
            return (
              <div key={fase} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`h-2 w-full rounded-full transition-colors ${
                    concluida ? 'bg-[#0891b2]' : ativa ? 'bg-[#0891b2]/40' : 'bg-slate-100'
                  }`}
                />
                <span className={`text-xs font-medium ${ativa ? meta.cor : concluida ? 'text-[#0891b2]' : 'text-slate-300'}`}>
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Visões do ciclo */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-slate-400">Visões</span>
        {[
          { label: 'Planejar',   href: `/pdca/${cicloId}/planejar`   },
          { label: 'Kanban',     href: `/pdca/${cicloId}/executar`   },
          { label: 'Calendário', href: `/pdca/${cicloId}/calendario` },
          { label: 'Gantt',      href: `/pdca/${cicloId}/gantt`      },
        ].map((v) => (
          <button
            key={v.href}
            onClick={() => router.push(v.href)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 hover:border-[#0891b2] hover:text-[#0891b2] transition-colors"
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Grid de fases + resumo lateral */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Cards de fases — 2 colunas no mobile, ocupa 2/3 no desktop */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {FASES.map((meta, idx) => {
            const concluida = idx < faseAtualIdx
            const ativa     = meta.fase === ciclo.fase_atual
            const bloqueada = idx > faseAtualIdx && !estaConcluido

            return (
              <button
                key={meta.fase}
                onClick={() => !bloqueada && router.push(meta.href(cicloId))}
                disabled={bloqueada}
                className={`relative flex flex-col rounded-2xl border p-5 text-left transition-all
                  ${ativa    ? `${meta.corBg} ${meta.corBorda} border shadow-sm` : ''}
                  ${concluida ? 'border-[#0891b2]/20 bg-[#0891b2]/5 hover:bg-[#0891b2]/10 cursor-pointer' : ''}
                  ${bloqueada ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-50' : ''}
                `}
              >
                {/* Indicador de fase ativa */}
                {ativa && (
                  <span className={`mb-2 self-start rounded-full px-2 py-0.5 text-xs font-bold ${meta.cor} bg-white/60`}>
                    Fase atual
                  </span>
                )}
                {concluida && (
                  <span className="mb-2 self-start text-xs text-[#0891b2]">✓ Concluída</span>
                )}
                {bloqueada && (
                  <span className="mb-2 self-start text-xs text-slate-400">🔒 Bloqueada</span>
                )}

                <span className={`text-base font-bold ${ativa ? meta.cor : concluida ? 'text-[#0891b2]' : 'text-slate-400'}`}>
                  {meta.label}
                </span>
                <span className="mt-1 text-xs text-slate-500 leading-relaxed">{meta.descricao}</span>

                {!bloqueada && (
                  <span className={`mt-3 text-xs font-semibold ${meta.cor}`}>
                    {ativa ? 'Continuar →' : 'Acessar →'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Painel lateral — resumo */}
        <div className="flex flex-col gap-4">

          {/* Progresso de tarefas */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Tarefas</p>
            {tarefaHook.carregando ? (
              <p className="text-xs text-slate-400">Carregando...</p>
            ) : totalTarefas === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma tarefa cadastrada ainda.</p>
            ) : (
              <>
                <div className="mb-3 flex items-end gap-1">
                  <span className="text-3xl font-black text-slate-900">{progresso}%</span>
                  <span className="mb-1 text-xs text-slate-400">concluído</span>
                </div>
                <div className="mb-3 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#0891b2] transition-all"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <span className="font-bold text-slate-700">{tarefaHook.aFazer.length}</span>
                    <span className="ml-1 text-slate-400">A fazer</span>
                  </div>
                  <div className="rounded-lg bg-green-50 px-3 py-2">
                    <span className="font-bold text-green-700">{tarefaHook.emProgresso.length}</span>
                    <span className="ml-1 text-slate-400">Em progresso</span>
                  </div>
                  <div className="rounded-lg bg-[#0891b2]/10 px-3 py-2">
                    <span className="font-bold text-[#0891b2]">{tarefaHook.concluidas.length}</span>
                    <span className="ml-1 text-slate-400">Concluídas</span>
                  </div>
                  <div className="rounded-lg bg-red-50 px-3 py-2">
                    <span className="font-bold text-red-600">{tarefaHook.canceladas.length}</span>
                    <span className="ml-1 text-slate-400">Bloqueadas</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Objetivos */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Objetivos</p>
            {objetivos.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhum objetivo definido.{' '}
                <button
                  onClick={() => router.push(`/pdca/${cicloId}/planejar`)}
                  className="text-[#0891b2] hover:underline"
                >
                  Planejar →
                </button>
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {objetivos.slice(0, 3).map((obj) => (
                  <li key={obj.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 leading-relaxed">
                    {obj.descricao}
                    {obj.metrica_alvo && (
                      <span className="ml-1 font-semibold text-[#0891b2]">→ {obj.metrica_alvo}</span>
                    )}
                  </li>
                ))}
                {objetivos.length > 3 && (
                  <li className="text-xs text-slate-400">+{objetivos.length - 3} objetivos</li>
                )}
              </ul>
            )}
          </div>

        </div>
      </div>

    </AppLayout>
  )
}
