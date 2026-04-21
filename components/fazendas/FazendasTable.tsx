import Link from 'next/link'
import type { Fazenda } from '@/hooks/useFazendas'

type Props = {
  registros: Fazenda[]
  onExcluir: (id: number) => void
}

export function FazendasTable({ registros, onExcluir }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-100 text-slate-600">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">#</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Nome</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {registros.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.id}</td>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.nome}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.descricao ?? '—'}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/fazendas/${item.id}`}
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
              <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                Nenhuma fazenda cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
