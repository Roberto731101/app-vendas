import { useMemo } from 'react'
import type { ItemVenda } from '@/types/venda-form'

type Props = {
  itens: ItemVenda[]
  vendaFinalizada: boolean
  onEditarItem: (item: ItemVenda) => void
  onExcluirItem: (id: number) => void
}

type GrupoItem = {
  classificacao: string
  tipo_caixa: string
  produto: string
  qtd_caixas: number
  kg_por_caixa: number
  peso_total: number
  valor_total: number
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

export function ItensVendaTable({ itens }: Props) {
  const grupos = useMemo<GrupoItem[]>(() => {
    const map = new Map<string, GrupoItem>()

    for (const item of itens) {
      const chave = `${item.classificacao}||${item.tipo_caixa}||${item.produto}||${item.kg_por_caixa}`
      const existente = map.get(chave)

      if (existente) {
        existente.qtd_caixas += item.qtd_caixas
        existente.peso_total += item.peso_total
        existente.valor_total += item.valor_total
      } else {
        map.set(chave, {
          classificacao: item.classificacao,
          tipo_caixa: item.tipo_caixa,
          produto: item.produto,
          qtd_caixas: item.qtd_caixas,
          kg_por_caixa: item.kg_por_caixa,
          peso_total: item.peso_total,
          valor_total: item.valor_total,
        })
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.classificacao !== b.classificacao)
        return a.classificacao.localeCompare(b.classificacao, 'pt-BR')
      if (a.tipo_caixa !== b.tipo_caixa)
        return a.tipo_caixa.localeCompare(b.tipo_caixa, 'pt-BR')
      return a.produto.localeCompare(b.produto, 'pt-BR')
    })
  }, [itens])

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
          Itens da Venda
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                Classificação
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                Tipo de Caixa
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-right">
                QTD
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-right">
                KG
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-right">
                Peso Tot
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {grupos.map((grupo) => (
              <tr
                key={`${grupo.classificacao}||${grupo.tipo_caixa}||${grupo.produto}`}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4 text-xs">
                  {grupo.classificacao}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {grupo.tipo_caixa}
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {grupo.produto}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {grupo.qtd_caixas}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {numero(grupo.kg_por_caixa)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {numero(grupo.peso_total)} Kg
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-[#063f81]">
                  {moeda(grupo.valor_total)}
                </td>
              </tr>
            ))}

            {grupos.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-6 text-center text-sm text-slate-500"
                >
                  Nenhum item cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
