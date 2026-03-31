import type { ColheitaLista } from '@/hooks/useColheitaForm'

type Props = {
  colheitas: ColheitaLista[]
  carregando: boolean
}

function numero(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })
}

export function ColheitasTable({ colheitas, carregando }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
          Colheitas do Lote
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                Setor
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                Cachos
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                Amostra
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                Observação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {colheitas.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4 text-sm">{item.id}</td>
                <td className="px-6 py-4 text-sm">{item.data_colheita}</td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {item.setores?.nome || `Setor ID ${item.setor_id}`}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {item.numero_cachos}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {item.amostra_peso_cacho !== null
                    ? numero(Number(item.amostra_peso_cacho))
                    : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {item.observacao || '-'}
                </td>
              </tr>
            ))}

            {!carregando && colheitas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-sm text-slate-500">
                  Nenhuma colheita cadastrada para o lote selecionado.
                </td>
              </tr>
            )}

            {carregando && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-sm text-slate-500">
                  Carregando colheitas...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
