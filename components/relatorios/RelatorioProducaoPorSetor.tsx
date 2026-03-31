import type { LinhaProducaoPorSetor, OrigemBase } from '@/hooks/useRelatorios'

type Props = {
  linhas: LinhaProducaoPorSetor[]
  carregando: boolean
}

function fmt(v: number | null, casas = 2) {
  if (v === null || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

const BADGE_ORIGEM: Record<OrigemBase, { label: string; cls: string }> = {
  AMOSTRA:  { label: 'Amostra',  cls: 'bg-blue-100 text-blue-700'   },
  RATIO:    { label: 'Ratio',    cls: 'bg-amber-100 text-amber-700' },
  SEM_BASE: { label: 'Sem base', cls: 'bg-slate-100 text-slate-500' },
}

export function RelatorioProducaoPorSetor({ linhas, carregando }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
            Produção por Setor
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Fonte: vw_peso_setor_corrigido · Base do peso: amostra_peso_cacho {'>'} ratio_medio
          </p>
        </div>
        {!carregando && (
          <span className="text-xs text-slate-400">{linhas.length} linha{linhas.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {carregando ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Setor</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Lote</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Cachos</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Peso obtido</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider">Origem</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Ratio Médio</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Peso Corrigido (kg)</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Hectares</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Prod. / ha (kg/ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {linhas.map((l, i) => {
                const badge = BADGE_ORIGEM[l.origemBase]
                return (
                  <tr key={`${l.setor_id}-${l.lote_id}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {l.setorNome}
                      <span className="ml-1 text-xs font-normal text-slate-400">Nº {l.setorNumero}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{l.loteCodigo}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">{l.totalCachos.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">{fmt(l.basePeso, 3)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-500">{fmt(l.ratioMedio, 3)}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{fmt(l.pesoCorrigido)}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">{fmt(l.hect, 2)}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#063f81]">{fmt(l.prodHectare)}</td>
                  </tr>
                )
              })}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-sm text-slate-400">
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
