import Link from 'next/link'
import type { ResumoPorLote } from '@/hooks/useResumoPorLote'
import type { OrigemPesoCacho } from '@/lib/pesoCachoEfetivo'

type Props = {
  resumos: ResumoPorLote[]
  carregando: boolean
  erro: string | null
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function numero(valor: number | null | undefined) {
  if (valor == null || Number.isNaN(valor)) return '—'
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })
}

const ORIGEM_CONFIG: Record<
  OrigemPesoCacho,
  { label: string; className: string }
> = {
  COLHEITA: {
    label: 'Colheita-registro',
    className: 'bg-blue-100 text-blue-700',
  },
  VENDA: {
    label: 'Venda',
    className: 'bg-emerald-100 text-emerald-700',
  },
  SEM_BASE: {
    label: 'Sem base',
    className: 'bg-amber-100 text-amber-700',
  },
}

function BadgeOrigem({ origem }: { origem: OrigemPesoCacho | undefined }) {
  const config = origem ? ORIGEM_CONFIG[origem] : ORIGEM_CONFIG['SEM_BASE']
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.className}`}
    >
      {config.label}
    </span>
  )
}

export function ResumoPorLote({ resumos, carregando, erro }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
          Resumo por Colheita-campo
        </h3>
        {!carregando && resumos.length > 0 && (
          <span className="text-xs text-slate-400">
            {resumos.length} {resumos.length === 1 ? 'colheita-campo' : 'colheita-campos'}
          </span>
        )}
      </div>

      {erro && (
        <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          Carregando...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                  Colheita-campo
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                  Total Cachos
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                  Peso Efetivo
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                  Origem
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                  Última Colheita-registro
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {resumos.map((item, index) => {
                const isUltimo = index === 0
                return (
                  <tr
                    key={item.lote_id}
                    className={
                      isUltimo
                        ? 'bg-blue-50 transition-colors hover:bg-blue-100'
                        : 'transition-colors hover:bg-slate-50'
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {item.codigo}
                        </span>
                        {isUltimo && (
                          <span className="rounded-full bg-[#063f81] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Recente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      {item.quantidadeRegistros}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      {item.totalCachos != null
                        ? item.totalCachos.toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      {numero(item.pesoCachoEfetivo)}
                    </td>
                    <td className="px-6 py-4">
                      <BadgeOrigem origem={item.origemPesoCacho} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatarData(item.ultimaColheita)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/colheita/${item.lote_id}`}
                        className="rounded-lg bg-[#063f81]/10 px-3 py-1.5 text-xs font-bold text-[#063f81] hover:bg-[#063f81]/20"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {resumos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Nenhuma colheita-registro registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
