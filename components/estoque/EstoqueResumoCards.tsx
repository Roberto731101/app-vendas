type Props = {
  totalAtivos: number
  emAlerta: number
  emCritico: number
  movimentacoesHoje: number
}

export function EstoqueResumoCards({ totalAtivos, emAlerta, emCritico, movimentacoesHoje }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Insumos</p>
        <p className="mt-2 text-3xl font-black text-slate-900">{totalAtivos}</p>
        <p className="mt-1 text-xs text-slate-500">itens ativos</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Em Atenção</p>
        <p className="mt-2 text-3xl font-black text-amber-500">{emAlerta}</p>
        <p className="mt-1 text-xs text-slate-500">abaixo de 120% do mínimo</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Em Crítico</p>
        <p className="mt-2 text-3xl font-black text-red-600">{emCritico}</p>
        <p className="mt-1 text-xs text-slate-500">abaixo do estoque mínimo</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Movimentações Hoje</p>
        <p className="mt-2 text-3xl font-black text-[#1a3a2a]">{movimentacoesHoje}</p>
        <p className="mt-1 text-xs text-slate-500">registros do dia</p>
      </div>
    </div>
  )
}
