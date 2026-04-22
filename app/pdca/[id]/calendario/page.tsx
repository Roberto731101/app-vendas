'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePdcaCiclos } from '@/hooks/usePdcaCiclos'
import { usePdcaTarefas } from '@/hooks/usePdcaTarefas'
import type { PdcaTarefa, PdcaStatus } from '@/types/pdca'
import { PdcaViewNav } from '@/components/pdca/PdcaViewNav'

// ── Constantes visuais ────────────────────────────────────────────────────────

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const STATUS_COR: Record<PdcaStatus, { bg: string; text: string; dot: string }> = {
  a_fazer:      { bg: 'bg-slate-100',      text: 'text-slate-700',  dot: 'bg-slate-400'  },
  em_progresso: { bg: 'bg-green-100',      text: 'text-green-800',  dot: 'bg-green-500'  },
  concluido:    { bg: 'bg-cyan-100',       text: 'text-cyan-800',   dot: 'bg-[#0891b2]'  },
  cancelado:    { bg: 'bg-red-100',        text: 'text-red-700',    dot: 'bg-red-500'    },
}

const PRIORIDADE_BORDA: Record<string, string> = {
  alta:  'border-l-2 border-red-400',
  media: 'border-l-2 border-amber-400',
  baixa: 'border-l-2 border-slate-200',
}

// ── Helpers de data ───────────────────────────────────────────────────────────

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function parsePrazo(prazo: string): Date {
  // Evita bug de timezone: adiciona T00:00:00 para tratar como local
  return new Date(prazo + 'T00:00:00')
}

function gerarDiasDoMes(ano: number, mes: number): (Date | null)[] {
  // mes: 0-indexed (igual ao Date)
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia   = new Date(ano, mes + 1, 0)
  const diasAntes   = primeiroDia.getDay()          // 0=dom
  const diasDepois  = 6 - ultimoDia.getDay()        // completar última semana

  const dias: (Date | null)[] = []
  for (let i = 0; i < diasAntes; i++)   dias.push(null)
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(ano, mes, d))
  for (let i = 0; i < diasDepois; i++)  dias.push(null)
  return dias
}

// ── Componente: card compacto de tarefa ───────────────────────────────────────

function TarefaChip({
  tarefa,
  atrasada,
  onClick,
}: {
  tarefa:   PdcaTarefa
  atrasada: boolean
  onClick:  () => void
}) {
  const cor = STATUS_COR[tarefa.status]
  return (
    <button
      onClick={onClick}
      title={`${tarefa.titulo} — ${tarefa.cargo_nome ?? ''}`}
      className={`w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium transition-opacity hover:opacity-80
        ${cor.bg} ${cor.text} ${PRIORIDADE_BORDA[tarefa.prioridade]}
        ${atrasada ? 'ring-1 ring-red-400 ring-inset' : ''}
      `}
    >
      {tarefa.titulo}
    </button>
  )
}

// ── Componente: célula de um dia ──────────────────────────────────────────────

function CelulaDia({
  date,
  tarefas,
  hoje,
  cicloId,
  router,
}: {
  date:    Date
  tarefas: PdcaTarefa[]
  hoje:    string
  cicloId: number
  router:  ReturnType<typeof useRouter>
}) {
  const isoDate   = toISO(date)
  const isHoje    = isoDate === hoje
  const isPast    = isoDate < hoje
  const visivel   = tarefas.slice(0, 3)
  const extras    = tarefas.length - visivel.length

  return (
    <div
      className={`flex min-h-[100px] flex-col gap-1 rounded-xl p-2 transition-colors
        ${isHoje ? 'bg-[#0891b2]/10 ring-1 ring-[#0891b2]/30' : 'bg-white hover:bg-slate-50'}
      `}
    >
      {/* Número do dia */}
      <div className="flex items-center justify-between">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
            ${isHoje ? 'bg-[#0891b2] text-white' : isPast ? 'text-slate-300' : 'text-slate-700'}
          `}
        >
          {date.getDate()}
        </span>
        {tarefas.length > 0 && (
          <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">
            {tarefas.length}
          </span>
        )}
      </div>

      {/* Cards de tarefa */}
      <div className="flex flex-col gap-0.5">
        {visivel.map((t) => (
          <TarefaChip
            key={t.id}
            tarefa={t}
            atrasada={isPast && t.status !== 'concluido' && t.status !== 'cancelado'}
            onClick={() => router.push(`/pdca/${cicloId}/executar`)}
          />
        ))}
        {extras > 0 && (
          <button
            onClick={() => router.push(`/pdca/${cicloId}/executar`)}
            className="w-full rounded px-1.5 py-0.5 text-left text-[10px] font-semibold text-[#0891b2] hover:underline"
          >
            +{extras} mais
          </button>
        )}
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const params  = useParams()
  const router  = useRouter()
  const cicloId = Number(params.id)

  const { registros: ciclos, carregando: carregandoCiclo } = usePdcaCiclos()
  const tarefaHook = usePdcaTarefas(cicloId)

  const ciclo = ciclos.find((c) => c.id === cicloId) ?? null

  const agora    = new Date()
  const hoje     = toISO(agora)
  const [ano,  setAno]  = useState(agora.getFullYear())
  const [mes,  setMes]  = useState(agora.getMonth())   // 0-indexed

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAno((a) => a - 1) }
    else setMes((m) => m - 1)
  }

  function mesSeguinte() {
    if (mes === 11) { setMes(0); setAno((a) => a + 1) }
    else setMes((m) => m + 1)
  }

  function irParaHoje() {
    setAno(agora.getFullYear())
    setMes(agora.getMonth())
  }

  // Agrupa tarefas por prazo (ISO date string)
  const tarefasPorDia = useMemo<Record<string, PdcaTarefa[]>>(() => {
    const mapa: Record<string, PdcaTarefa[]> = {}
    for (const t of tarefaHook.registros) {
      if (!t.prazo) continue
      const key = t.prazo  // já é YYYY-MM-DD no banco
      if (!mapa[key]) mapa[key] = []
      mapa[key].push(t)
    }
    return mapa
  }, [tarefaHook.registros])

  const dias = useMemo(() => gerarDiasDoMes(ano, mes), [ano, mes])

  const nomeMes = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Contadores do mês visível
  const tarefasDoMes = useMemo(() => {
    return tarefaHook.registros.filter((t) => {
      if (!t.prazo) return false
      const d = parsePrazo(t.prazo)
      return d.getFullYear() === ano && d.getMonth() === mes
    })
  }, [tarefaHook.registros, ano, mes])

  const semPrazo = tarefaHook.registros.filter((t) => !t.prazo)

  // ── Loading / not found ────────────────────────────────────────────────────

  if (carregandoCiclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Calendário', active: true }]}>
        <div className="flex items-center justify-center py-24 text-sm text-slate-400">Carregando...</div>
      </AppLayout>
    )
  }

  if (!ciclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Calendário', active: true }]}>
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
    { label: 'Calendário', active: true },
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
            <span className="text-slate-600">Calendário</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Calendário</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visualize os prazos das tarefas de <span className="font-medium text-slate-700">{ciclo.titulo}</span>.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <PdcaViewNav cicloId={cicloId} ativa="calendario" />
        </div>
      </div>

      {/* Navegação do mês + legenda */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Navegação */}
        <div className="flex items-center gap-2">
          <button
            onClick={mesAnterior}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Mês anterior"
          >
            ‹
          </button>
          <span className="min-w-[160px] text-center text-sm font-bold capitalize text-slate-800">
            {nomeMes}
          </span>
          <button
            onClick={mesSeguinte}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Próximo mês"
          >
            ›
          </button>
          <button
            onClick={irParaHoje}
            className="ml-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Hoje
          </button>
        </div>

        {/* Legenda de status */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {(Object.entries(STATUS_COR) as [PdcaStatus, typeof STATUS_COR[PdcaStatus]][]).map(([status, cor]) => (
            <span key={status} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${cor.dot}`} />
              {{ a_fazer: 'A fazer', em_progresso: 'Em progresso', concluido: 'Concluído', cancelado: 'Cancelado' }[status]}
            </span>
          ))}
          <span className="ml-2 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400 ring-1 ring-red-400" />
            Atrasada
          </span>
        </div>
      </div>

      {/* Resumo do mês */}
      {tarefasDoMes.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            <strong className="text-slate-700">{tarefasDoMes.length}</strong> tarefas neste mês
          </span>
          {tarefasDoMes.filter((t) => t.status === 'concluido').length > 0 && (
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700 shadow-sm">
              <strong>{tarefasDoMes.filter((t) => t.status === 'concluido').length}</strong> concluídas
            </span>
          )}
          {tarefasDoMes.filter((t) => t.prazo && t.prazo < hoje && t.status !== 'concluido' && t.status !== 'cancelado').length > 0 && (
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-700 shadow-sm">
              <strong>{tarefasDoMes.filter((t) => t.prazo && t.prazo < hoje && t.status !== 'concluido' && t.status !== 'cancelado').length}</strong> atrasadas
            </span>
          )}
          {semPrazo.length > 0 && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 shadow-sm">
              <strong>{semPrazo.length}</strong> sem prazo
            </span>
          )}
        </div>
      )}

      {/* Grid do calendário */}
      <div className="rounded-2xl bg-slate-100 p-2 shadow-sm">

        {/* Cabeçalho dos dias da semana */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="py-1.5 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
              {dia}
            </div>
          ))}
        </div>

        {/* Células */}
        <div className="grid grid-cols-7 gap-2">
          {dias.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="min-h-[100px] rounded-xl" />
            }
            const isoDate    = toISO(date)
            const tarefasDia = tarefasPorDia[isoDate] ?? []
            return (
              <CelulaDia
                key={isoDate}
                date={date}
                tarefas={tarefasDia}
                hoje={hoje}
                cicloId={cicloId}
                router={router}
              />
            )
          })}
        </div>
      </div>

      {/* Tarefas sem prazo */}
      {semPrazo.length > 0 && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Sem prazo definido — {semPrazo.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {semPrazo.map((t) => {
              const cor = STATUS_COR[t.status]
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/pdca/${cicloId}/executar`)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${cor.bg} ${cor.text} ${PRIORIDADE_BORDA[t.prioridade]} hover:opacity-80`}
                >
                  {t.titulo}
                </button>
              )
            })}
          </div>
        </div>
      )}

    </AppLayout>
  )
}
