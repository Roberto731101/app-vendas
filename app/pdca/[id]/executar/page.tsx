'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePdcaCiclos } from '@/hooks/usePdcaCiclos'
import { usePdcaTarefas } from '@/hooks/usePdcaTarefas'
import { supabase } from '@/lib/supabase'
import type { PdcaTarefa, PdcaStatus } from '@/types/pdca'
import { PdcaViewNav } from '@/components/pdca/PdcaViewNav'

// ── Tipos locais ──────────────────────────────────────────────────────────────

type UsuarioSimples = { id: number; nome: string; cargo_nome: string | null }

// ── Metadados das colunas ─────────────────────────────────────────────────────

type ColunaMeta = {
  status:  PdcaStatus
  label:   string
  cor:     string
  corBg:   string
  corDot:  string
}

const COLUNAS: ColunaMeta[] = [
  { status: 'a_fazer',      label: 'A Fazer',      cor: 'text-slate-600',  corBg: 'bg-slate-50',   corDot: 'bg-slate-400'  },
  { status: 'em_progresso', label: 'Em Progresso', cor: 'text-green-700',  corBg: 'bg-green-50',   corDot: 'bg-green-500'  },
  { status: 'concluido',    label: 'Concluído',    cor: 'text-[#0891b2]',  corBg: 'bg-cyan-50',    corDot: 'bg-[#0891b2]'  },
  { status: 'cancelado',    label: 'Cancelado',    cor: 'text-red-600',    corBg: 'bg-red-50',     corDot: 'bg-red-500'    },
]

const PRIORIDADE_COR: Record<string, string> = {
  alta:  'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-slate-100 text-slate-600',
}

const PRIORIDADE_LABEL: Record<string, string> = {
  alta: 'Alta', media: 'Média', baixa: 'Baixa',
}

// Próximo status no fluxo de avanço
const PROXIMO_STATUS: Partial<Record<PdcaStatus, PdcaStatus>> = {
  a_fazer:      'em_progresso',
  em_progresso: 'concluido',
}

// ── Componente: card de tarefa ────────────────────────────────────────────────

function KanbanCard({
  tarefa,
  usuarios,
  onAvancar,
  onCancelar,
  onRetroceder,
  onAtribuir,
  onObservacao,
}: {
  tarefa:        PdcaTarefa
  usuarios:      UsuarioSimples[]
  onAvancar:     (id: number) => void
  onCancelar:    (id: number) => void
  onRetroceder:  (id: number) => void
  onAtribuir:    (id: number, executorId: number | null) => void
  onObservacao:  (id: number) => void
}) {
  const [mostrarAtribuir, setMostrarAtribuir] = useState(false)
  const proximo = PROXIMO_STATUS[tarefa.status]

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3">

      {/* Prioridade + prazo */}
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORIDADE_COR[tarefa.prioridade]}`}>
          {PRIORIDADE_LABEL[tarefa.prioridade]}
        </span>
        {tarefa.prazo && (
          <span className="text-xs text-slate-400">
            {new Date(tarefa.prazo + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>

      {/* Título */}
      <p className="text-sm font-semibold text-slate-800 leading-snug">{tarefa.titulo}</p>

      {/* Cargo + executor */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span>{tarefa.cargo_nome ?? '—'}</span>
        </div>
        {tarefa.executor_nome ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
            <span>{tarefa.executor_nome}</span>
          </div>
        ) : (
          <span className="text-xs italic text-slate-300">sem executor</span>
        )}
      </div>

      {/* Localização */}
      {tarefa.fazenda_nome && (
        <p className="text-xs text-slate-400 truncate">
          📍 {[tarefa.fazenda_nome, tarefa.area_nome, tarefa.setor_nome].filter(Boolean).join(' / ')}
        </p>
      )}

      {/* Atribuir executor */}
      {mostrarAtribuir && (
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="mb-1.5 text-xs font-medium text-slate-600">Atribuir executor</p>
          <select
            defaultValue={tarefa.executor_id ?? ''}
            onChange={(e) => {
              onAtribuir(tarefa.id, e.target.value ? Number(e.target.value) : null)
              setMostrarAtribuir(false)
            }}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0891b2]"
          >
            <option value="">Sem executor</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}{u.cargo_nome ? ` — ${u.cargo_nome}` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => setMostrarAtribuir(false)}
            className="mt-1.5 w-full rounded-lg py-1 text-xs text-slate-400 hover:text-slate-600"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">

        {/* Avançar status */}
        {proximo && (
          <button
            onClick={() => onAvancar(tarefa.id)}
            className="flex-1 rounded-lg bg-[#0891b2]/10 py-1.5 text-xs font-semibold text-[#0891b2] hover:bg-[#0891b2]/20"
          >
            {proximo === 'em_progresso' ? 'Iniciar →' : 'Concluir ✓'}
          </button>
        )}

        {/* Cancelar (disponível em a_fazer e em_progresso) */}
        {(tarefa.status === 'a_fazer' || tarefa.status === 'em_progresso') && (
          <button
            onClick={() => onCancelar(tarefa.id)}
            className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
          >
            Cancelar
          </button>
        )}

        {/* Retroceder (disponível em em_progresso, concluido, bloqueado) */}
        {tarefa.status !== 'a_fazer' && (
          <button
            onClick={() => onRetroceder(tarefa.id)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
          >
            ← Voltar
          </button>
        )}

        {/* Atribuir executor */}
        {!mostrarAtribuir && (
          <button
            onClick={() => setMostrarAtribuir(true)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
          >
            👤
          </button>
        )}

        {/* Observação — preparado, viável */}
        <button
          onClick={() => onObservacao(tarefa.id)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
          title="Registrar observação"
        >
          💬
        </button>

      </div>
    </div>
  )
}

// ── Modal de observação ───────────────────────────────────────────────────────

function ModalObservacao({
  tarefaId,
  cicloId,
  onClose,
  onSalvo,
}: {
  tarefaId: number
  cicloId:  number
  onClose:  () => void
  onSalvo:  () => void
}) {
  const [tipo,      setTipo]      = useState<'observacao' | 'cancelamento' | 'oportunidade'>('observacao')
  const [descricao, setDescricao] = useState('')
  const [salvando,  setSalvando]  = useState(false)
  const [erro,      setErro]      = useState<string | null>(null)

  async function salvar() {
    if (!descricao.trim()) { setErro('Descreva a observação.'); return }
    setSalvando(true)

    const { data: { session } } = await supabase.auth.getSession()

    // Resolver usuario_id (int) a partir do auth_id (uuid)
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_id', session?.user.id ?? '')
      .single()

    if (!userData) { setErro('Usuário não encontrado. Faça login novamente.'); setSalvando(false); return }

    const { error } = await supabase.from('pdca_observacoes').insert([{
      ciclo_id:   cicloId,
      tarefa_id:  tarefaId,
      tipo,
      descricao:  descricao.trim(),
      criado_por: (userData as { id: number }).id,
    }])

    setSalvando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  const TIPO_META = {
    observacao:   { label: 'Observação',  cor: 'bg-slate-100 text-slate-700'  },
    cancelamento: { label: 'Cancelamento', cor: 'bg-red-100 text-red-700'     },
    oportunidade: { label: 'Oportunidade', cor: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Registrar observação</h2>

        {erro && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</div>}

        {/* Tipo */}
        <div className="mb-4 flex gap-2">
          {(Object.keys(TIPO_META) as (keyof typeof TIPO_META)[]).map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                tipo === t ? TIPO_META[t].cor : 'bg-slate-100 text-slate-400'
              }`}
            >
              {TIPO_META[t].label}
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva a observação, bloqueio ou oportunidade identificada..."
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
          autoFocus
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 rounded-xl bg-[#0891b2] py-2 text-sm font-semibold text-white hover:bg-[#0e7490] disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Registrar'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function ExecutarPage() {
  const params  = useParams()
  const router  = useRouter()
  const cicloId = Number(params.id)

  const { registros: ciclos, carregando: carregandoCiclo } = usePdcaCiclos()
  const tarefaHook = usePdcaTarefas(cicloId)

  const ciclo = ciclos.find((c) => c.id === cicloId) ?? null

  // Usuários para atribuição de executor
  const [usuarios, setUsuarios] = useState<UsuarioSimples[]>([])
  useEffect(() => {
    supabase
      .from('usuarios')
      .select('id, nome, cargos:cargo_id (nome)')
      .eq('ativo', true)
      .order('nome', { ascending: true })
      .then(({ data }) => {
        setUsuarios(
          ((data ?? []) as Record<string, unknown>[]).map((r) => {
            const cargo = r['cargos'] as { nome: string } | null
            return {
              id:         Number(r['id']),
              nome:       String(r['nome'] ?? ''),
              cargo_nome: cargo?.nome ?? null,
            }
          })
        )
      })
  }, [])

  // Modal de observação
  const [observacaoTarefaId, setObservacaoTarefaId] = useState<number | null>(null)

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleAvancar(id: number) {
    const tarefa  = tarefaHook.registros.find((t) => t.id === id)
    const proximo = tarefa ? PROXIMO_STATUS[tarefa.status] : null
    if (proximo) tarefaHook.alterarStatus(id, proximo)
  }

  function handleCancelar(id: number) {
    tarefaHook.alterarStatus(id, 'cancelado')
  }

  function handleRetroceder(id: number) {
    const tarefa = tarefaHook.registros.find((t) => t.id === id)
    if (!tarefa) return
    const anterior: Record<PdcaStatus, PdcaStatus> = {
      em_progresso: 'a_fazer',
      concluido:    'em_progresso',
      cancelado:    'a_fazer',
      a_fazer:      'a_fazer',
    }
    tarefaHook.alterarStatus(id, anterior[tarefa.status])
  }

  function handleAtribuir(id: number, executorId: number | null) {
    tarefaHook.atribuirExecutor(id, executorId)
  }

  // ── Loading / not found ────────────────────────────────────────────────────

  if (carregandoCiclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Execução', active: true }]}>
        <div className="flex items-center justify-center py-24 text-sm text-slate-400">Carregando...</div>
      </AppLayout>
    )
  }

  if (!ciclo) {
    return (
      <AppLayout headerNavItems={[{ label: 'PDCA', href: '/pdca' }, { label: 'Execução', active: true }]}>
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
    { label: 'Executar', active: true },
  ]

  // Array de tarefas por coluna
  const tarefasPorStatus: Record<PdcaStatus, PdcaTarefa[]> = {
    a_fazer:      tarefaHook.aFazer,
    em_progresso: tarefaHook.emProgresso,
    concluido:    tarefaHook.concluidas,
    cancelado:    tarefaHook.canceladas,
  }

  const totalTarefas = tarefaHook.registros.length
  const concluidas   = tarefaHook.concluidas.length
  const progresso    = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0

  return (
    <AppLayout headerNavItems={NAV_HEADER}>

      {/* Modal de observação */}
      {observacaoTarefaId !== null && (
        <ModalObservacao
          tarefaId={observacaoTarefaId}
          cicloId={cicloId}
          onClose={() => setObservacaoTarefaId(null)}
          onSalvo={() => setObservacaoTarefaId(null)}
        />
      )}

      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-xs text-slate-400">
            <button onClick={() => router.push('/pdca')} className="hover:text-[#0891b2]">PDCA</button>
            <span>/</span>
            <button onClick={() => router.push(`/pdca/${cicloId}`)} className="hover:text-[#0891b2]">{ciclo.titulo}</button>
            <span>/</span>
            <span className="text-slate-600">Executar</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kanban</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe a execução de <span className="font-medium text-slate-700">{ciclo.titulo}</span>.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <PdcaViewNav cicloId={cicloId} ativa="executar" />
        </div>
      </div>

      {/* Feedback */}
      {tarefaHook.erro     && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{tarefaHook.erro}</div>}
      {tarefaHook.mensagem && <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{tarefaHook.mensagem}</div>}

      {/* Barra de progresso geral */}
      {totalTarefas > 0 && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Progresso geral</span>
              <span className="font-bold text-[#0891b2]">{progresso}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[#0891b2] transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
          <div className="flex gap-3 text-xs text-slate-500 shrink-0">
            <span><strong className="text-slate-700">{totalTarefas}</strong> tarefas</span>
            <span><strong className="text-[#0891b2]">{concluidas}</strong> concluídas</span>
            {tarefaHook.canceladas.length > 0 && (
              <span><strong className="text-red-600">{tarefaHook.canceladas.length}</strong> canceladas</span>
            )}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!tarefaHook.carregando && totalTarefas === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <span className="text-4xl">📋</span>
          <p className="mt-4 text-sm font-medium text-slate-700">Nenhuma tarefa planejada</p>
          <p className="mt-1 text-xs text-slate-400">Vá para o Planejamento para criar as tarefas do ciclo.</p>
          <button
            onClick={() => router.push(`/pdca/${cicloId}/planejar`)}
            className="mt-5 rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0e7490]"
          >
            Ir para Planejamento
          </button>
        </div>
      )}

      {/* Board Kanban */}
      {totalTarefas > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUNAS.map((col) => {
            const tarefas = tarefasPorStatus[col.status]
            return (
              <div key={col.status} className="flex flex-col gap-3">

                {/* Cabeçalho da coluna */}
                <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${col.corBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.corDot}`} />
                    <span className={`text-sm font-bold ${col.cor}`}>{col.label}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.corBg} ${col.cor}`}>
                    {tarefas.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {tarefas.length === 0 ? (
                    <div className={`rounded-xl border-2 border-dashed border-slate-100 py-8 text-center text-xs text-slate-300`}>
                      vazio
                    </div>
                  ) : (
                    tarefas.map((tarefa) => (
                      <KanbanCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        usuarios={usuarios}
                        onAvancar={handleAvancar}
                        onCancelar={handleCancelar}
                        onRetroceder={handleRetroceder}
                        onAtribuir={handleAtribuir}
                        onObservacao={(id) => setObservacaoTarefaId(id)}
                      />
                    ))
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

    </AppLayout>
  )
}
