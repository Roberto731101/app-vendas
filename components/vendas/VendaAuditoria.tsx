import type { RegistroAuditoria } from '@/hooks/useVendaAuditoria'

type Props = {
  registros: RegistroAuditoria[]
  carregando: boolean
  erro: string | null
  onRecarregar: () => void
}

const EVENTO_CONFIG: Record<string, { label: string; cor: string }> = {
  venda_criada:     { label: 'Venda criada',     cor: 'bg-blue-100 text-blue-700' },
  item_adicionado:  { label: 'Item adicionado',  cor: 'bg-green-100 text-green-700' },
  item_editado:     { label: 'Item editado',      cor: 'bg-amber-100 text-amber-700' },
  item_excluido:    { label: 'Item excluído',     cor: 'bg-red-100 text-red-600' },
  venda_finalizada: { label: 'Venda finalizada',  cor: 'bg-green-200 text-green-800' },
  venda_reaberta:   { label: 'Venda reaberta',    cor: 'bg-amber-200 text-amber-800' },
  venda_excluida:   { label: 'Venda excluída',    cor: 'bg-red-200 text-red-800' },
}

function formatarDataHora(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatarDetalhes(detalhes: Record<string, unknown> | null) {
  if (!detalhes) return null
  const entradas = Object.entries(detalhes).filter(([, v]) => v !== null && v !== undefined)
  if (entradas.length === 0) return null
  return entradas
}

export function VendaAuditoria({ registros, carregando, erro, onRecarregar }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
          Histórico de Eventos
        </h3>
        <button
          onClick={onRecarregar}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
        >
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="px-6 py-8 text-center text-sm text-slate-500">Carregando...</p>
      ) : registros.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-500">
          Nenhum evento registrado.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {registros.map((registro) => {
            const config = EVENTO_CONFIG[registro.evento] ?? {
              label: registro.evento,
              cor: 'bg-slate-100 text-slate-600',
            }
            const detalhes = formatarDetalhes(registro.detalhes)

            return (
              <li key={registro.id} className="flex gap-4 px-6 py-4">
                <div className="mt-0.5 shrink-0">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.cor}`}
                  >
                    {config.label}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  {detalhes && (
                    <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                      {detalhes.map(([chave, valor]) => (
                        <div key={chave} className="flex items-baseline gap-1">
                          <dt className="text-[10px] font-bold uppercase text-slate-400">
                            {chave.replace(/_/g, ' ')}
                          </dt>
                          <dd className="text-xs text-slate-700">
                            {String(valor)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <p className="mt-1 text-[10px] text-slate-400">
                    {formatarDataHora(registro.criado_em)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
