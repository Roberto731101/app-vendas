'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useAvaliacao, type SetorQuadra, type StatusAvaliacao } from '@/hooks/useAvaliacao'

// ── Constantes de status ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  3: { label: 'OK',             cor: 'bg-emerald-50 border-emerald-500 text-emerald-700', icon: '✓' },
  2: { label: 'EM ANDAMENTO',   cor: 'bg-amber-50  border-amber-400   text-amber-700',   icon: '⚠' },
  1: { label: 'NÃO REALIZADO',  cor: 'bg-red-50    border-red-500     text-red-700',      icon: '✕' },
} as const

// ── Sub-componentes ───────────────────────────────────────────────────────────

function CardQuadra({
  quadra,
  ativa,
  onClick,
}: {
  quadra: SetorQuadra
  ativa: boolean
  onClick: () => void
}) {
  const labelCurto = quadra.nome.replace('Quadra ', '')
  return (
    <button
      onClick={onClick}
      className={[
        'snap-start flex-shrink-0 w-24 h-24 rounded-xl flex flex-col items-center justify-center',
        'border-b-4 transition-all active:scale-90 shadow-sm',
        ativa
          ? 'bg-[#cbe7f5] border-[#0891b2] text-[#001e40]'
          : 'bg-white border-transparent text-slate-500 hover:bg-slate-50',
      ].join(' ')}
    >
      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Quadra</span>
      <span className="text-2xl font-black leading-tight">{labelCurto}</span>
    </button>
  )
}

function BotaoStatus({
  status,
  ativo,
  onClick,
}: {
  status: StatusAvaliacao
  ativo: boolean
  onClick: () => void
}) {
  const cfg = STATUS_CONFIG[status]
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border-b-2',
        'transition-all active:scale-90 text-center',
        ativo ? cfg.cor : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100',
      ].join(' ')}
    >
      <span className="text-base leading-none mb-0.5">{cfg.icon}</span>
      <span className="text-[8px] font-bold uppercase leading-tight">{cfg.label}</span>
    </button>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AvaliacaoPage() {
  const {
    quadras,
    linhas,
    statusLocal,
    quadraSelecionada,
    setQuadraSelecionada,
    dataAvaliacao,
    setDataAvaliacao,
    carregandoQuadras,
    carregandoLinhas,
    salvando,
    erro,
    mensagem,
    setErro,
    setMensagem,
    alterarStatus,
    finalizarAvaliacao,
    contagem,
  } = useAvaliacao()

  async function handleFinalizar() {
    const ok = await finalizarAvaliacao()
    if (ok) {
      setTimeout(() => setMensagem(null), 4000)
    }
  }

  return (
    <AppLayout headerNavItems={[{ label: 'Avaliação de Campo', active: true }]}>
      {/* ── Cabeçalho da página ─────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0891b2] mb-1">
          Operacional
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Painel de Avaliação
        </h1>
        <div className="h-1 w-10 bg-[#0891b2] mt-3 rounded-full" />
      </div>

      <div className="max-w-lg space-y-6">

        {/* ── Seletor de Data ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <span className="text-[#0891b2]">📅</span>
            Data da Avaliação
          </label>
          <input
            type="date"
            value={dataAvaliacao}
            onChange={(e) => {
              setDataAvaliacao(e.target.value)
              setErro(null)
              setMensagem(null)
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
                       text-slate-800 outline-none focus:border-[#0891b2] focus:ring-2
                       focus:ring-[#0891b2]/10 transition"
          />
        </div>

        {/* ── Seletor de Quadra (scroll horizontal) ────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="text-[#0891b2]">▦</span>
              Seleção de Quadra
            </label>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Scroll Lateral
            </span>
          </div>

          {carregandoQuadras ? (
            <p className="px-5 pb-5 text-sm text-slate-400">Carregando quadras…</p>
          ) : (
            <div className="flex overflow-x-auto px-5 pb-5 gap-3 snap-x"
                 style={{ scrollbarWidth: 'none' }}>
              {quadras.map((q) => (
                <CardQuadra
                  key={q.id}
                  quadra={q}
                  ativa={quadraSelecionada?.id === q.id}
                  onClick={() => {
                    setQuadraSelecionada(q)
                    setErro(null)
                    setMensagem(null)
                  }}
                />
              ))}
              {quadras.length === 0 && (
                <p className="text-sm text-slate-400 py-2">
                  Nenhuma quadra encontrada. Execute a migration e o script de importação.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Feedback ─────────────────────────────────────────────── */}
        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}
        {mensagem && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {mensagem}
          </div>
        )}

        {/* ── Lista de Becas ────────────────────────────────────────── */}
        {quadraSelecionada && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Status do Trabalho</h2>
              {!carregandoLinhas && (
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                    {contagem.total} Becas
                  </span>
                  {contagem.ok > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                      ✓ {contagem.ok}
                    </span>
                  )}
                  {contagem.emAndamento > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                      ⚠ {contagem.emAndamento}
                    </span>
                  )}
                </div>
              )}
            </div>

            {carregandoLinhas ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Carregando becas…</p>
            ) : linhas.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                Nenhuma beca cadastrada para {quadraSelecionada.nome}.<br />
                Execute o script de importação primeiro.
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {linhas.map((linha) => {
                  const statusAtual = statusLocal.get(linha.id) ?? 1
                  return (
                    <div key={linha.id} className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 mb-2">
                        Beca {String(linha.numero).padStart(2, '0')}
                      </p>
                      <div className="flex gap-1.5">
                        {([3, 2, 1] as StatusAvaliacao[]).map((s) => (
                          <BotaoStatus
                            key={s}
                            status={s}
                            ativo={statusAtual === s}
                            onClick={() => alterarStatus(linha.id, s)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Botão Finalizar ───────────────────────────────────────── */}
        {quadraSelecionada && linhas.length > 0 && (
          <button
            onClick={handleFinalizar}
            disabled={salvando}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0891b2] to-[#0e7490]
                       text-white font-extrabold text-base shadow-lg shadow-[#0891b2]/20
                       flex items-center justify-center gap-2
                       hover:from-[#0e7490] hover:to-[#164e63]
                       disabled:opacity-60 disabled:cursor-not-allowed
                       active:scale-[0.98] transition-all"
          >
            {salvando ? (
              <>Salvando…</>
            ) : (
              <>Finalizar Avaliação →</>
            )}
          </button>
        )}
      </div>
    </AppLayout>
  )
}
