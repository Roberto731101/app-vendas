type Resumo = {
  totalItens: number
  totalCaixas: number
  pesoLiquidoTotal: number
  valorTotalGeral: number
  porClassificacao: Record<string, number>
}

type Props = {
  resumo: Resumo
  vendaSalva: boolean
  vendaFinalizada: boolean
  finalizando: boolean
  onFinalizar: () => void
  onReabrir: () => void
}

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function numero(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function VendaResumo({ resumo, vendaSalva, vendaFinalizada, finalizando, onFinalizar, onReabrir }: Props) {
  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="sticky top-24 rounded-2xl border-t-4 border-[#063f81] bg-white p-8 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <span className="text-[#063f81]">📄</span>
          Resumo da Venda
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                Total Itens
              </p>
              <p className="text-xl font-black text-[#063f81]">
                {resumo.totalItens.toString().padStart(2, '0')}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                Total Caixas
              </p>
              <p className="text-xl font-black text-[#063f81]">
                {resumo.totalCaixas}
              </p>
            </div>

            <div className="col-span-2 rounded-xl bg-slate-100 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                Peso Líquido Total
              </p>
              <p className="text-xl font-black text-[#063f81]">
                {numero(resumo.pesoLiquidoTotal)} Kg
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="border-b border-slate-200 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Por Classificação
            </p>

            {Object.keys(resumo.porClassificacao).length === 0 && (
              <div className="text-xs text-slate-500">
                Sem itens cadastrados.
              </div>
            )}

            {Object.entries(resumo.porClassificacao).map(([chave, valor]) => (
              <div
                key={chave}
                className="flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-500">
                  {chave}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {moeda(valor)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-6">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#063f81]">
              Valor Total Geral
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#2b579a]">
                R$
              </span>
              <span className="text-4xl font-black tracking-tighter text-[#063f81]">
                {numero(resumo.valorTotalGeral)}
              </span>
            </div>
          </div>

          <div className="pt-4">
            {vendaFinalizada ? (
              <div className="space-y-3">
                <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-100 py-4 text-sm font-black uppercase tracking-widest text-green-700">
                  <span>✓</span>
                  <span>Venda Finalizada</span>
                </div>
                <button
                  onClick={onReabrir}
                  className="w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-3 text-xs font-bold uppercase tracking-widest text-amber-700 transition hover:bg-amber-100"
                >
                  Reabrir Venda
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onFinalizar}
                  disabled={!vendaSalva || finalizando}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#063f81] to-[#2b579a] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/30 transition hover:scale-[1.02] disabled:opacity-70"
                >
                  {finalizando ? 'Finalizando...' : 'Finalizar e Salvar'}
                </button>

                <p className="mt-4 text-center text-[10px] font-medium italic text-slate-500">
                  * Confirme os dados antes de finalizar o registro
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
