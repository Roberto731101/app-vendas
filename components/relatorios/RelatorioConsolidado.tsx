import type { LinhaConsolidado } from '@/hooks/useRelatorios'

type Props = {
  linhas: LinhaConsolidado[]
  carregando: boolean
}

function fmtKg(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function RelatorioConsolidado({ linhas, carregando }: Props) {
  const totalCachos     = linhas.reduce((s, l) => s + l.totalCachos, 0)
  const totalCorrigido  = linhas.reduce((s, l) => s + l.pesoCorrigidoTotal, 0)
  const totalVendido    = linhas.reduce((s, l) => s + l.pesoVendidoTotal, 0)
  const totalDiferenca  = totalCorrigido - totalVendido

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
            Consolidado por Lote
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Produção estimada vs peso efetivamente vendido
          </p>
        </div>
        {!carregando && (
          <span className="text-xs text-slate-400">{linhas.length} lote{linhas.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {carregando ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Lote</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Total Cachos</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Peso Corrigido (kg)</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Peso Vendido (kg)</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Diferença (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {linhas.map((l) => (
                <tr key={l.lote_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{l.codigo}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">{l.totalCachos.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">{fmtKg(l.pesoCorrigidoTotal)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">{fmtKg(l.pesoVendidoTotal)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${
                      l.diferenca >= 0 ? 'text-green-700' : 'text-red-600'
                    }`}>
                      {l.diferenca >= 0 ? '+' : ''}{fmtKg(l.diferenca)}
                    </span>
                  </td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                    Nenhum dado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
            {linhas.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-6 py-3 text-xs font-bold uppercase text-slate-500">Total</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">{totalCachos.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">{fmtKg(totalCorrigido)}</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">{fmtKg(totalVendido)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`text-sm font-bold ${totalDiferenca >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {totalDiferenca >= 0 ? '+' : ''}{fmtKg(totalDiferenca)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}
