'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePdcaCiclos } from '@/hooks/usePdcaCiclos'
import type { PdcaCicloInsert, PdcaFase } from '@/types/pdca'

const NAV_HEADER = [
  { label: 'Operacional', active: true },
  { label: 'PDCA' },
]

const FASE_LABEL: Record<PdcaFase, string> = {
  planejar:  'Planejamento',
  executar:  'Execução',
  verificar: 'Verificação',
  agir:      'Ação',
  concluido: 'Concluído',
}

const FASE_COR: Record<PdcaFase, string> = {
  planejar:  'bg-cyan-100 text-cyan-700',
  executar:  'bg-green-100 text-green-700',
  verificar: 'bg-amber-100 text-amber-700',
  agir:      'bg-violet-100 text-violet-700',
  concluido: 'bg-slate-100 text-slate-500',
}

const FORM_VAZIO: PdcaCicloInsert = {
  titulo:            '',
  descricao:         null,
  fase_atual:        'planejar',
  data_inicio:       null,
  data_fim_prevista: null,
  criado_por:        null,
}

export default function PdcaPage() {
  const router = useRouter()
  const { registros, carregando, salvando, erro, mensagem, salvar, setErro, setMensagem } = usePdcaCiclos()

  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState<PdcaCicloInsert>(FORM_VAZIO)

  function abrirForm() {
    setForm(FORM_VAZIO)
    setErro(null)
    setMensagem(null)
    setMostrarForm(true)
  }

  function fecharForm() {
    setMostrarForm(false)
    setForm(FORM_VAZIO)
  }

  async function handleSalvar() {
    if (!form.titulo.trim()) { setErro('O título do ciclo é obrigatório.'); return }
    const ok = await salvar(form)
    if (ok) fecharForm()
  }

  const ativos    = registros.filter((c) => c.fase_atual !== 'concluido')
  const concluidos = registros.filter((c) => c.fase_atual === 'concluido')

  return (
    <AppLayout headerNavItems={NAV_HEADER}>

      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Ciclos PDCA</h1>
          <p className="mt-1 text-sm text-slate-500">
            Planeje, execute e acompanhe os ciclos operacionais da propriedade.
          </p>
        </div>
        <button
          onClick={abrirForm}
          className="self-start rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490] sm:self-auto"
        >
          + Novo Ciclo
        </button>
      </div>

      {/* Feedback */}
      {erro     && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}
      {mensagem && <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{mensagem}</div>}

      {/* Formulário inline — novo ciclo */}
      {mostrarForm && (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Novo ciclo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Ciclo de Manutenção — Abril 2026"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Data de início</label>
              <input
                type="date"
                value={form.data_inicio ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value || null }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Previsão de término</label>
              <input
                type="date"
                value={form.data_fim_prevista ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, data_fim_prevista: e.target.value || null }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Descrição</label>
              <textarea
                rows={2}
                value={form.descricao ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value || null }))}
                placeholder="Objetivo geral do ciclo (opcional)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0e7490] disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Criar ciclo'}
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

      {/* Estado de carregamento */}
      {carregando && (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          Carregando ciclos...
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && registros.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <span className="text-4xl">🔄</span>
          <p className="mt-4 text-sm font-medium text-slate-700">Nenhum ciclo criado ainda</p>
          <p className="mt-1 text-xs text-slate-400">Crie o primeiro ciclo para iniciar o planejamento.</p>
          <button
            onClick={abrirForm}
            className="mt-5 rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0e7490]"
          >
            + Novo Ciclo
          </button>
        </div>
      )}

      {/* Ciclos ativos */}
      {!carregando && ativos.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Em andamento — {ativos.length}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ativos.map((ciclo) => (
              <div key={ciclo.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${FASE_COR[ciclo.fase_atual]}`}>
                    {FASE_LABEL[ciclo.fase_atual]}
                  </span>
                  {ciclo.data_fim_prevista && (
                    <span className="text-xs text-slate-400">
                      até {new Date(ciclo.data_fim_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">{ciclo.titulo}</h3>
                {ciclo.descricao && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{ciclo.descricao}</p>
                )}
                {ciclo.data_inicio && (
                  <p className="mt-2 text-xs text-slate-400">
                    Iniciado em {new Date(ciclo.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                )}
                <button
                  onClick={() => router.push(`/pdca/${ciclo.id}`)}
                  className="mt-4 w-full rounded-xl bg-[#0891b2]/10 py-2 text-xs font-semibold text-[#0891b2] hover:bg-[#0891b2]/20"
                >
                  Abrir ciclo →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ciclos concluídos */}
      {!carregando && concluidos.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Concluídos — {concluidos.length}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {concluidos.map((ciclo) => (
              <div key={ciclo.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm opacity-70">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${FASE_COR[ciclo.fase_atual]}`}>
                    {FASE_LABEL[ciclo.fase_atual]}
                  </span>
                  {ciclo.data_fim_prevista && (
                    <span className="text-xs text-slate-400">
                      {new Date(ciclo.data_fim_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">{ciclo.titulo}</h3>
                {ciclo.descricao && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{ciclo.descricao}</p>
                )}
                <button
                  onClick={() => router.push(`/pdca/${ciclo.id}`)}
                  className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Ver ciclo →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </AppLayout>
  )
}
