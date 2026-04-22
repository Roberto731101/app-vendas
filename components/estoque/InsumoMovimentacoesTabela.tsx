import type { Movimentacao } from '@/hooks/useMovimentacoes'

type Props = {
  movimentacoes: Movimentacao[]
}

function fmtData(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

function localMovimentacao(mov: Movimentacao): string {
  const partes: string[] = []
  if (mov.fazenda_nome) partes.push(mov.fazenda_nome)
  if (mov.setor_nome)   partes.push(mov.setor_nome)
  else if (mov.area_nome) partes.push(mov.area_nome)
  return partes.join(' / ') || '—'
}

export function InsumoMovimentacoesTabela({ movimentacoes }: Props) {
  const visiveis = movimentacoes.slice(0, 10)

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Histórico de Movimentações
        </h2>
        {movimentacoes.length > 10 && (
          <span className="text-xs text-slate-400">
            Exibindo 10 de {movimentacoes.length} registros
          </span>
        )}
      </div>

      {visiveis.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-slate-400">
          Nenhuma movimentação registrada.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Data</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Local</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Quantidade</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visiveis.map((mov) => {
                const isEntrada = mov.tipo_movimentacao === 'entrada'
                return (
                  <tr key={mov.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {fmtData(mov.data_movimentacao)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isEntrada
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <span>{isEntrada ? '↓' : '↑'}</span>
                        {isEntrada ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {localMovimentacao(mov)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`text-base font-black ${
                          isEntrada ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {isEntrada ? '+' : '-'}
                        {mov.quantidade.toLocaleString('pt-BR')}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">{mov.unidade}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {mov.usuario_nome ?? 'Sistema'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
