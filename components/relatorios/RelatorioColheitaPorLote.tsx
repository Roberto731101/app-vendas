import type { LinhaColheitaPorLote } from '@/hooks/useRelatorios'
import type { OrigemPesoCacho } from '@/lib/pesoCachoEfetivo'

type Props = {
  linhas: LinhaColheitaPorLote[]
  carregando: boolean
}

function fmt(v: number | null, casas = 2) {
  if (v === null || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

function fmtData(iso: string) {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

const BADGE: Record<OrigemPesoCacho, { label: string; cls: string }> = {
  COLHEITA: { label: 'Colheita-registro', cls: 'bg-blue-100 text-blue-700' },
  VENDA:    { label: 'Venda',    cls: 'bg-amber-100 text-amber-700' },
  SEM_BASE: { label: 'Sem base', cls: 'bg-slate-100 text-slate-500' },
}

export function RelatorioColheitaPorLote({ linhas, carregando }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
          Colheita-registro por Colheita-campo
        </h3>
        {!carregando && (
          <span className="text-xs text-slate-400">{linhas.length} colheita-campo{linhas.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {carregando ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Colheita-campo</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Última Colheita-registro</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Registros</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Total Cachos</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Ratio Médio</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider">Origem Peso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {linhas.map((l) => {
                const badge = BADGE[l.origemPesoCacho]
                return (
                  <tr key={l.lote_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{l.codigo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{fmtData(l.ultimaColheita)}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">{l.quantidadeRegistros.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">{l.totalCachos.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-500">{fmt(l.ratioMedio, 3)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    Nenhum dado encontrado.
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
