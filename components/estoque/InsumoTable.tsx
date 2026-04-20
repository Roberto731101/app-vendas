import type { Insumo } from '@/hooks/useInsumos'
import { CategoriaPill } from './CategoriaPill'
import { StatusBadge } from './StatusBadge'

type Props = {
  registros: Insumo[]
  onEditar: (insumo: Insumo) => void
  onMovimentar: (insumo: Insumo) => void
  onExcluir: (id: number) => void
}

function fmtData(iso: string | null) {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

export function InsumoTable({ registros, onEditar, onMovimentar, onExcluir }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Categoria</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Nome do Insumo</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Marca/Fornecedor</th>
            <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Quantidade</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Validade</th>
            <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {registros.map((i) => (
            <tr key={i.id} className="transition-colors hover:bg-slate-50">
              <td className="px-5 py-4">
                {i.nome_categoria ? (
                  <CategoriaPill nome={i.nome_categoria} tipo={i.tipo_categoria} />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <p className="font-semibold text-slate-900">{i.nome_insumo}</p>
                {i.lote && <p className="text-xs text-slate-400">Lote: {i.lote}</p>}
              </td>
              <td className="px-5 py-4 text-sm text-slate-600">{i.marca_fornecedor ?? '—'}</td>
              <td className="px-5 py-4 text-right">
                <span className="text-base font-black text-slate-900">
                  {i.quantidade_atual.toLocaleString('pt-BR')}
                </span>
                <span className="ml-1 text-xs text-slate-400">{i.unidade}</span>
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={i.status_estoque} />
              </td>
              <td className="px-5 py-4 text-sm text-slate-600">{fmtData(i.data_validade)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onMovimentar(i)}
                    className="rounded-lg bg-[#1a3a2a]/10 px-3 py-1.5 text-xs font-semibold text-[#1a3a2a] hover:bg-[#1a3a2a]/20"
                  >
                    Movimentar
                  </button>
                  <button
                    onClick={() => onEditar(i)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onExcluir(i.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {registros.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                Nenhum insumo encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Cards de rodapé da tabela
type RodapeProps = {
  registros: Insumo[]
}

export function InsumoTableRodape({ registros }: RodapeProps) {
  const ativos = registros.filter((i) => i.ativo)
  const criticos = ativos.filter((i) => i.status_estoque === 'critico')
  const proximaValidade = ativos
    .filter((i) => i.data_validade)
    .sort((a, b) => (a.data_validade! > b.data_validade! ? 1 : -1))[0]

  function fmtData(iso: string | null) {
    if (!iso) return '—'
    const [a, m, d] = iso.split('-')
    return `${d}/${m}/${a}`
  }

  return (
    <div className="grid grid-cols-1 gap-4 border-t border-slate-100 p-5 sm:grid-cols-3">
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total em Estoque</p>
        <p className="mt-1 text-2xl font-black text-slate-900">{ativos.length}</p>
        <p className="text-xs text-slate-500">insumos ativos</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Próxima Validade</p>
        <p className="mt-1 text-lg font-bold text-slate-900">{fmtData(proximaValidade?.data_validade ?? null)}</p>
        <p className="text-xs text-slate-500">{proximaValidade?.nome_insumo ?? 'Nenhum com validade'}</p>
      </div>
      <div className="rounded-xl bg-red-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Itens Críticos</p>
        <p className="mt-1 text-2xl font-black text-red-600">{criticos.length}</p>
        <p className="text-xs text-red-500">abaixo do mínimo</p>
      </div>
    </div>
  )
}
