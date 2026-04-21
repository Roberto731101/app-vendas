import type { LinhaProducaoPorSetor } from '@/hooks/useRelatorios'

type Props = {
  linhas: LinhaProducaoPorSetor[]
  carregando: boolean
}

function fmt(v: number | null, casas = 2) {
  if (v === null || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

export function RelatorioProducaoPorSetor({ linhas, carregando }: Props) {
  const totalCachos = linhas.reduce((s, l) => s + l.totalCachos, 0)
  const totalPeso   = linhas.reduce((s, l) => s + l.pesoCorrigido, 0)

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
          Produção por Setor
        </h3>
        {!carregando && (
          <span className="text-xs text-slate-400">{linhas.length} linha{linhas.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {carregando ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '13%' }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Setor</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Lote</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Total de Cachos</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Hectares</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Peso Corrigido (kg)</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Prod. / ha (kg/ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {linhas.map((l, i) => (
                <tr key={`${l.setor_id}-${l.lote_id}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {l.setorNome}
                    <span className="ml-1 text-xs font-normal text-slate-400">Nº {l.setorNumero}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{l.loteCodigo}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{l.totalCachos.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{fmt(l.hect, 2)}</td>
                  <td className="col-peso-corrigido px-4 py-3 text-right text-sm font-semibold text-slate-900">{fmt(l.pesoCorrigido)}</td>
                  <td className="col-prod-hectare px-4 py-3 text-right text-sm font-bold text-[#0891b2]">{fmt(l.prodHectare)}</td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    Nenhum dado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
            {linhas.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Total</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{totalCachos.toLocaleString('pt-BR')}</td>
                  <td />
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{fmt(totalPeso)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}
