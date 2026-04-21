import type { Produto, TipoCaixa, Classificacao } from '@/types/venda-form'

type Props = {
  // Dados de lookup
  produtos: Produto[]
  tiposCaixa: TipoCaixa[]
  classificacoes: Classificacao[]

  // Valores do formulário
  produto: string
  tipoCaixa: string
  classificacao: string
  qtdCaixas: string
  kgPorCaixa: string
  valorKg: string

  // Setters
  setProduto: (v: string) => void
  setTipoCaixa: (v: string) => void
  setClassificacao: (v: string) => void
  setQtdCaixas: (v: string) => void
  setKgPorCaixa: (v: string) => void
  setValorKg: (v: string) => void

  // Estado de controle
  vendaSalva: boolean
  salvandoItem: boolean
  itemEditandoId: number | null
  vendaFinalizada: boolean

  // Handlers
  onAdicionarItem: () => void
  onCancelarEdicao: () => void
}

export function ItemVendaForm({
  produtos,
  tiposCaixa,
  classificacoes,
  produto,
  tipoCaixa,
  classificacao,
  qtdCaixas,
  kgPorCaixa,
  valorKg,
  setProduto,
  setTipoCaixa,
  setClassificacao,
  setQtdCaixas,
  setKgPorCaixa,
  setValorKg,
  vendaSalva,
  salvandoItem,
  itemEditandoId,
  vendaFinalizada,
  onAdicionarItem,
  onCancelarEdicao,
}: Props) {
  if (vendaFinalizada) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="text-lg">🔒</span>
          <span>Venda finalizada — não é possível adicionar ou editar itens.</span>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
          Adicionar Itens
        </h3>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-[#0e7490]">
          Entrada Rápida
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        <div className="col-span-2 space-y-1.5 sm:col-span-1 md:col-span-2">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Produto
          </label>
          <select
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Selecione</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.nome}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 space-y-1.5 sm:col-span-1 md:col-span-2">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Tipo de Caixa
          </label>
          <select
            value={tipoCaixa}
            onChange={(e) => setTipoCaixa(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Selecione</option>
            {tiposCaixa.map((t) => (
              <option key={t.id} value={t.nome}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 space-y-1.5 sm:col-span-1 md:col-span-2">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Classificação
          </label>
          <select
            value={classificacao}
            onChange={(e) => setClassificacao(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Selecione</option>
            {classificacoes.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Qtd CX
          </label>
          <input
            type="number"
            value={qtdCaixas}
            onChange={(e) => setQtdCaixas(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Kg CX
          </label>
          <input
            type="number"
            step="0.1"
            value={kgPorCaixa}
            onChange={(e) => setKgPorCaixa(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            VLR Kg
          </label>
          <input
            type="number"
            step="0.01"
            value={valorKg}
            onChange={(e) => setValorKg(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="col-span-2 flex items-end gap-2 sm:col-span-3 md:col-span-3">
          {itemEditandoId !== null && (
            <button
              onClick={onCancelarEdicao}
              className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
            >
              Cancelar edição
            </button>
          )}
          <button
            onClick={onAdicionarItem}
            disabled={!vendaSalva || salvandoItem}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0e7490]/20 bg-[#0891b2]/5 py-2.5 text-sm font-bold text-[#0891b2] transition hover:bg-[#0891b2]/10 disabled:opacity-50"
          >
            {salvandoItem
              ? itemEditandoId !== null ? 'Salvando...' : 'Adicionando...'
              : itemEditandoId !== null ? 'Salvar alteração' : 'Adicionar item'}
          </button>
        </div>
      </div>
    </section>
  )
}
