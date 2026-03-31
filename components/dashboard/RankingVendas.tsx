import type { ItemRanking } from '@/hooks/useDashboardVendas'

type Props = {
  titulo: string
  itens: ItemRanking[]
}

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function RankingVendas({ titulo, itens }: Props) {
  const max = itens[0]?.valor ?? 0

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {titulo}
        </h3>
      </div>

      {itens.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-400">
          Sem dados para o período selecionado.
        </p>
      ) : (
        <ul className="divide-y divide-slate-50 px-6 py-2">
          {itens.map((item, index) => (
            <li key={item.nome} className="flex items-center gap-4 py-3">
              <span className="w-5 shrink-0 text-center text-xs font-black text-slate-300">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {item.nome}
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#063f81]"
                    style={{ width: max > 0 ? `${(item.valor / max) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              <span className="shrink-0 text-sm font-bold text-[#063f81]">
                {moeda(item.valor)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
