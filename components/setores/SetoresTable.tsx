import Link from 'next/link'
import type { Setor } from '@/hooks/useSetores'

type Props = {
  registros: Setor[]
  onExcluir: (id: number) => void
}

export function SetoresTable({ registros, onExcluir }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-100 text-slate-600">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">#</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Nome</th>
            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">Nº</th>
            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">Hectares</th>
            <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {registros.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.id}</td>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.nome}</td>
              <td className="px-6 py-4 text-right text-sm text-slate-600">{item.numero}</td>
              <td className="px-6 py-4 text-right text-sm text-slate-600">
                {item.hect != null
                  ? item.hect.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : '—'}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/setores/${item.id}`}
                    className="rounded-lg bg-[#0891b2]/10 px-3 py-1.5 text-xs font-bold text-[#0891b2] hover:bg-[#0891b2]/20"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => onExcluir(item.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {registros.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                Nenhum setor cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
