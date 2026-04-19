import Link from 'next/link'
import type { ColheitaHistorico } from '@/hooks/useColheitasHistorico'

type Props = {
  colheitas: ColheitaHistorico[]
  filtrosAtivos?: boolean
}

function formatarData(data: string | null) {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function numero(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })
}

export function ColheitasHistoricoTable({ colheitas, filtrosAtivos }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-100 text-slate-600">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
              Setor
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
              Colheita-campo
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
              Cachos
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
              Amostra
            </th>
            <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
              Ação
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {colheitas.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-xs text-slate-400">
                {item.id}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatarData(item.data_colheita)}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                {item.setores
                  ? `${item.setores.nome} — Nº ${item.setores.numero}`
                  : `Setor ID ${item.setor_id}`}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {item.lotes_fechamento?.codigo ?? '—'}
              </td>
              <td className="px-6 py-4 text-right text-sm text-slate-600">
                {item.numero_cachos}
              </td>
              <td className="px-6 py-4 text-right text-sm text-slate-600">
                {item.amostra_peso_cacho !== null
                  ? numero(Number(item.amostra_peso_cacho))
                  : '—'}
              </td>
              <td className="px-6 py-4 text-center">
                {item.lote_id !== null ? (
                  <Link
                    href={`/colheita/${item.lote_id}`}
                    className="rounded-lg bg-[#063f81]/10 px-3 py-1.5 text-xs font-bold text-[#063f81] hover:bg-[#063f81]/20"
                  >
                    Abrir
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">Sem colheita-campo</span>
                )}
              </td>
            </tr>
          ))}

          {colheitas.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                {filtrosAtivos
                  ? 'Nenhuma colheita-registro encontrada para os filtros aplicados.'
                  : 'Nenhuma colheita-registro registrada.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
