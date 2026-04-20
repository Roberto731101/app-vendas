import type { Insumo } from '@/hooks/useInsumos'
import { CategoriaPill } from './CategoriaPill'
import { StatusBadge } from './StatusBadge'

type Props = {
  insumo: Insumo
  onMovimentar?: (id: number) => void
  onEditar?: (insumo: Insumo) => void
}

export function InsumoCard({ insumo, onMovimentar, onEditar }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-5">
        {/* Quantidade em destaque */}
        <div className="flex flex-col items-center text-center">
          <span className="text-3xl font-black leading-none text-slate-900">
            {insumo.quantidade_atual.toLocaleString('pt-BR')}
          </span>
          <span className="mt-0.5 text-xs font-semibold uppercase text-slate-400">{insumo.unidade}</span>
        </div>

        <div className="h-10 w-px bg-slate-100" />

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900">{insumo.nome_insumo}</p>
            {insumo.status_estoque === 'critico' && (
              <span className="text-red-500">▲</span>
            )}
          </div>
          {insumo.marca_fornecedor && (
            <p className="text-xs text-slate-500">{insumo.marca_fornecedor}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            {insumo.nome_categoria && (
              <CategoriaPill nome={insumo.nome_categoria} tipo={insumo.tipo_categoria} />
            )}
            <StatusBadge status={insumo.status_estoque} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        {onMovimentar && (
          <button
            onClick={() => onMovimentar(insumo.id)}
            className="rounded-xl bg-[#1a3a2a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f2419]"
          >
            Movimentar
          </button>
        )}
        {onEditar && (
          <button
            onClick={() => onEditar(insumo)}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )
}
