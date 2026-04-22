'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePdcaCiclos } from '@/hooks/usePdcaCiclos'
import { usePdcaTarefas } from '@/hooks/usePdcaTarefas'
import { PdcaViewNav } from '@/components/pdca/PdcaViewNav'
import type { PdcaTarefa, PdcaStatus } from '@/types/pdca'

// ── Constantes ────────────────────────────────────────────────────────────────

type Janela = 7 | 14 | 21 | 30

const JANELAS: Janela[] = [7, 14, 21, 30]

// Largura de cada coluna de dia — aumenta com janela menor (mais zoom)
const COL_WIDTH: Record<Janela, number> = { 7: 80, 14: 60, 21: 46, 30: 36 }

const ALTURA_HEADER_DIA  = 48  // px
const ALTURA_CARGO_ROW   = 32  // px
const ALTURA_TAREFA_ROW  = 52  // px

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const STATUS_BAR: Record<PdcaStatus, { bg: string; text: string }> = {
  a_fazer:      { bg: 'bg-slate-300',  text: 'text-slate-700' },
  em_progresso: { bg: 'bg-green-400',  text: 'text-white'     },
  concluido:    { bg: 'bg-[#0891b2]',  text: 'text-white'     },
  cancelado:    { bg: 'bg-slate-200',  text: 'text-slate-400' },
}

const PRIORIDADE_BORDA: Record<string, string> = {
  alta:  'border-l-4 border-red-400',
  media: 'border-l-4 border-amber-400',
  baixa: 'border-l-4 border-slate-300',
}

// ── Helpers de data ───────────────────────────────────────────────────────────

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseDate(s: string): Date {
  return new Date(s + 'T00:00:00')
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

// ── Tipos locais ──────────────────────────────────────────────────────────────

type BarInfo = {
  left:      number
  width:     number
  valida:    boolean
  atrasada:  boolean
}

// ── Componente: barra de tarefa ───────────────────────────────────────────────

function GanttBar({
  tarefa,
  bar,
  colWidth,
  onClick,
}: {
  tarefa:   PdcaTarefa
  bar:      BarInfo
  colWidth: number
  onClick:  () => void
}) {
  const cor       = STATUS_BAR[tarefa.status]
  const prioridade = PRIORIDADE_BORDA[tarefa.prioridade] ?? ''

  return (
    <button
      onClick={onClick}
      title={`${tarefa.titulo}${tarefa.cargo_nome ? ` — ${tarefa.cargo_nome}` : ''}`}
      className={`absolute flex items-center overflow-hidden rounded-lg px-2 transition-opacity hover:opacity-80
        ${cor.bg} ${prioridade}
        ${bar.atrasada ? 'ring-2 ring-red-500 ring-inset' : ''}
      `}
      style={{
        left:   bar.left,
        width:  Math.max(bar.width, colWidth),
        top:    10,
        height: 32,
      }}
    >
      {bar.width >= colWidth * 2 && (
        <span className={`truncate text-xs font-semibold ${cor.text}`}>
          {tarefa.titulo}
        </span>
      )}
    </button>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function GanttPage() {
  const params  = useParams()
  const router  = useRouter()
  const cicloId = Number(params.id)

  const { registros: ciclos, carregando: carregandoCiclo } = usePdcaCiclos()
  const tarefaHook = usePdcaTarefas(cicloId)
  const ciclo = ciclos.find((c) => c.id === cicloId) ?? null

  const [janela, setJanela] = useState<Janela>(14)
  const scrollRef = useRef<HTMLDivElement>(null)

  const colWidth = COL_WIDTH[janela]

  // ── Calcular eixo de tempo ─────────────────────────────────────────────────

  const { timelineStart, timelineDays } = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    let start = ciclo?.data_inicio ? parseDate(ciclo.data_inicio) : new Date(hoje)
    let end   = ciclo?.data_fim_prevista ? parseDate(ciclo.data_fim_prevista) : addDays(hoje, 30)

    for (const t of tarefaHook.registros) {
      if (t.data_inicio_prevista) {
        const d = parseDate(t.data_inicio_prevista)
        if (d < start) start = d
      }
      const fimS = t.data_fim_prevista ?? t.prazo
      if (fimS) {
        const d = parseDate(fimS)
        if (d > end) end = d
      }
    }

    start = addDays(start, -3)
    end   = addDays(end,    3)

    const days: Date[] = []
    const cur = new Date(start)
    while (cur <= end) {
      days.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }

    return { timelineStart: start, timelineDays: days }
  }, [ciclo, tarefaHook.registros])

  const hoje    = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const hojeISO = toISO(hoje)
  const hojeIdx = timelineDays.findIndex((d) => toISO(d) === hojeISO)
  const totalWidth = timelineDays.length * colWidth

  // ── Auto-scroll para hoje ──────────────────────────────────────────────────

  useEffect(() => {
    if (scrollRef.current && hojeIdx >= 0) {
      const alvo = hojeIdx * colWidth - 80
      scrollRef.current.scrollLeft = Math.max(0, alvo)
    }
  }, [hojeIdx, colWidth, tarefaHook.carregando])

  // ── Calcular barra de uma tarefa ───────────────────────────────────────────

  function calcBar(tarefa: PdcaTarefa): BarInfo {
    const fimS = tarefa.data_fim_prevista ?? tarefa.prazo
    if (!fimS) return { left: 0, width: 0, valida: false, atrasada: false }

    const fim    = parseDate(fimS)
    const inicio = tarefa.data_inicio_prevista ? parseDate(tarefa.data_inicio_prevista) : fim

    const left    = diffDays(timelineStart, inicio) * colWidth
    const duracao = Math.max(1, diffDays(inicio, fim) + 1)
    const width   = duracao * colWidth
    const atrasada = fim < hoje
      && tarefa.status !== 'concluido'
      && tarefa.status !== 'cancelado'

    return { left, width, valida: true, atrasada }
  }

  // ── Agrupar por cargo ──────────────────────────────────────────────────────

  const { grupos, semData } = useMemo(() => {
    const mapa: Record<string, PdcaTarefa[]> = {}
    const semData: PdcaTarefa[] = []

    for (const t of tarefaHook.registros) {
      const temData = t.data_inicio_prevista || t.data_fim_prevista || t.prazo
      if (!temData) { semData.push(t); continue }
      const key = t.cargo_nome ?? 'Sem cargo'
      if (!mapa[key]) mapa[key] = []
      mapa[key].push(t)
    }

    return { grupos: mapa, semData }
  }, [tarefaHook.registros])

  const temDados = Object.keys(grupos).length > 0

  // ── Loading / not found ────────────────────────────────────────────────────

  if (carregandoCiclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Gantt', active: true }]}>
        <div className="flex items-center justify-center py-24 text-sm text-slate-400">Carregando...</div>
      </AppLayout>
    )
  }

  if (!ciclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Gantt', active: true }]}>
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
    { label: 'Gantt', active: true },
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
            <span className="text-slate-600">Gantt</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Gantt</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sequência das tarefas de <span className="font-medium text-slate-700">{ciclo.titulo}</span>.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <PdcaViewNav cicloId={cicloId} ativa="gantt" />
        </div>
      </div>

      {/* Controles */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

        {/* Seletor de janela */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          <span className="px-2 text-xs font-semibold text-slate-400">Zoom</span>
          {JANELAS.map((j) => (
            <button
              key={j}
              onClick={() => setJanela(j)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                j === janela
                  ? 'bg-[#0891b2] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {j}d
            </button>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm bg-slate-300" />A fazer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm bg-green-400" />Em progresso
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm bg-[#0891b2]" />Concluído
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm bg-slate-300 ring-2 ring-red-500 ring-inset" />Atrasado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-0.5 bg-[#0891b2]/60" />Hoje
          </span>
        </div>
      </div>

      {/* Gantt */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {tarefaHook.carregando ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">
            Carregando tarefas...
          </div>
        ) : !temDados && semData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl">📅</span>
            <p className="mt-4 text-sm font-medium text-slate-700">Nenhuma tarefa com período definido</p>
            <p className="mt-1 text-xs text-slate-400">
              Vá para Planejar e preencha o início e fim previstos das tarefas.
            </p>
            <button
              onClick={() => router.push(`/pdca/${cicloId}/planejar`)}
              className="mt-5 rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0e7490]"
            >
              Ir para Planejar
            </button>
          </div>
        ) : (
          <div className="flex">

            {/* ── Coluna esquerda fixa ──────────────────────────────────────── */}
            <div className="w-56 shrink-0 border-r border-slate-100">

              {/* Alinhamento com header de datas */}
              <div style={{ height: ALTURA_HEADER_DIA }} className="border-b border-slate-100 bg-slate-50" />

              {Object.entries(grupos).map(([cargo, tarefas]) => (
                <div key={cargo}>
                  {/* Header do cargo */}
                  <div
                    style={{ height: ALTURA_CARGO_ROW }}
                    className="flex items-center border-b border-slate-100 bg-slate-50/80 px-4"
                  >
                    <span className="truncate text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {cargo}
                    </span>
                  </div>

                  {/* Linhas de tarefa */}
                  {tarefas.map((t) => (
                    <div
                      key={t.id}
                      style={{ height: ALTURA_TAREFA_ROW }}
                      className="flex items-center gap-2 border-b border-slate-50 px-4 hover:bg-[#0891b2]/5 transition-colors"
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_BAR[t.status].bg}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 leading-tight">
                          {t.titulo}
                        </p>
                        {(t.data_inicio_prevista || t.data_fim_prevista || t.prazo) && (
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                            {t.data_inicio_prevista
                              ? new Date(t.data_inicio_prevista + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                              : '—'
                            }
                            {' → '}
                            {(t.data_fim_prevista ?? t.prazo)
                              ? new Date((t.data_fim_prevista ?? t.prazo)! + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                              : '—'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* ── Coluna direita scrollável ─────────────────────────────────── */}
            <div ref={scrollRef} className="flex-1 overflow-x-auto">
              <div className="relative" style={{ width: totalWidth }}>

                {/* Header de datas */}
                <div
                  className="flex border-b border-slate-100 bg-slate-50"
                  style={{ height: ALTURA_HEADER_DIA }}
                >
                  {timelineDays.map((day, i) => {
                    const isHoje   = toISO(day) === hojeISO
                    const isFimSem = day.getDay() === 0 || day.getDay() === 6
                    const isMes1   = day.getDate() === 1 || i === 0
                    return (
                      <div
                        key={i}
                        style={{ width: colWidth }}
                        className={`shrink-0 flex flex-col items-center justify-end pb-1.5
                          ${isHoje ? 'bg-[#0891b2]/10' : isFimSem ? 'bg-slate-100/60' : ''}
                        `}
                      >
                        {isMes1 && (
                          <span className="text-[9px] font-bold uppercase text-slate-400">
                            {MESES_ABREV[day.getMonth()]}
                          </span>
                        )}
                        <span className={`text-xs font-bold leading-none ${
                          isHoje ? 'text-[#0891b2]' : isFimSem ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {day.getDate()}
                        </span>
                        {colWidth >= 46 && (
                          <span className={`text-[9px] leading-none mt-0.5 ${
                            isHoje ? 'text-[#0891b2]' : 'text-slate-400'
                          }`}>
                            {DIAS_SEMANA[day.getDay()]}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Linha vertical de hoje */}
                {hojeIdx >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 z-10 w-0.5 bg-[#0891b2]/50"
                    style={{ left: hojeIdx * colWidth + colWidth / 2 }}
                  />
                )}

                {/* Grupos de cargo — barras */}
                {Object.entries(grupos).map(([cargo, tarefas]) => (
                  <div key={cargo}>
                    {/* Spacer alinhado com header do cargo */}
                    <div
                      style={{ height: ALTURA_CARGO_ROW }}
                      className="border-b border-slate-100 bg-slate-50/30"
                    />

                    {tarefas.map((t) => {
                      const bar = calcBar(t)
                      return (
                        <div
                          key={t.id}
                          className="relative border-b border-slate-50"
                          style={{ height: ALTURA_TAREFA_ROW }}
                        >
                          {bar.valida && (
                            <GanttBar
                              tarefa={t}
                              bar={bar}
                              colWidth={colWidth}
                              onClick={() => router.push(`/pdca/${cicloId}/executar`)}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}

              </div>
            </div>

          </div>
        )}
      </div>

      {/* Tarefas sem data */}
      {semData.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Sem período definido — {semData.length} {semData.length === 1 ? 'tarefa' : 'tarefas'}
          </p>
          <div className="flex flex-wrap gap-2">
            {semData.map((t) => (
              <span
                key={t.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
                  ${STATUS_BAR[t.status].bg} ${STATUS_BAR[t.status].text}
                `}
              >
                {t.titulo}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Defina início e fim previsto em{' '}
            <button
              onClick={() => router.push(`/pdca/${cicloId}/planejar`)}
              className="text-[#0891b2] hover:underline"
            >
              Planejar
            </button>{' '}
            para exibir essas tarefas no Gantt.
          </p>
        </div>
      )}

    </AppLayout>
  )
}
