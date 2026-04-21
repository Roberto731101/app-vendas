import type { LinhaVendaPorLote } from '@/hooks/useRelatorios'

type Props = {
  linhas: LinhaVendaPorLote[]
  carregando: boolean
}

function fmtKg(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtReais(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(iso: string | null) {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

export function RelatorioVendasPorLote({ linhas, carregando }: Props) {
  const totalPeso  = linhas.reduce((s, l) => s + l.pesoTotal,  0)
  const totalValor = linhas.reduce((s, l) => s + l.valorTotal, 0)

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
          Vendas por Lote
        </h3>
        {!carregando && (
          <span className="text-xs text-slate-400">{linhas.length} venda{linhas.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {carregando ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Lote</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Ordem</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Peso Total (kg)</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {linhas.map((l) => (
                <tr key={l.venda_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{l.loteCodigo}</td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">{l.ordemVenda}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{l.cliente}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{fmtData(l.dataVenda)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">{fmtKg(l.pesoTotal)}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{fmtReais(l.valorTotal)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      l.finalizada
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {l.finalizada ? 'Finalizada' : 'Aberta'}
                    </span>
                  </td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
            {linhas.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={4} className="px-6 py-3 text-xs font-bold uppercase text-slate-500">Total</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">{fmtKg(totalPeso)}</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">{fmtReais(totalValor)}</td>
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
