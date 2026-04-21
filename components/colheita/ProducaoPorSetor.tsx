import type { LinhaProducaoSetor } from '@/hooks/useProducaoPorSetor'
import type { Setor } from '@/types/colheita'

type Props = {
  linhas: LinhaProducaoSetor[]
  setores: Setor[]
  carregando: boolean
  erro: string | null
}

type AgregadoSetor = {
  setor_id: number
  nomeSetor: string
  hect: number | null
  totalCachos: number
  pesoTotal: number | null    // null se nenhuma linha tem peso_setor_corrigido
  prodHectare: number | null  // pesoTotal / hect; null quando falta base ou área
  temBase: boolean
}

function kg(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function agregar(linhas: LinhaProducaoSetor[], setores: Setor[]): AgregadoSetor[] {
  const setorMap = new Map(setores.map((s) => [s.id, s]))

  const mapa = new Map<number, AgregadoSetor>()

  for (const linha of linhas) {
    const setor = setorMap.get(linha.setor_id)
    const entrada = mapa.get(linha.setor_id)

    // Acumula peso apenas quando a view fornece valor calculado
    const pesoParcial =
      linha.peso_setor_corrigido !== null
        ? Number(linha.peso_setor_corrigido)
        : null

    const pesoAtual = entrada?.pesoTotal ?? null
    const novoTotal =
      pesoParcial !== null
        ? (pesoAtual ?? 0) + pesoParcial
        : pesoAtual

    const hect = setor?.hect ?? null

    mapa.set(linha.setor_id, {
      setor_id: linha.setor_id,
      nomeSetor: setor ? `${setor.nome} — Nº ${setor.numero}` : `Setor ${linha.setor_id}`,
      hect,
      totalCachos: (entrada?.totalCachos ?? 0) + linha.numero_cachos,
      pesoTotal: novoTotal,
      prodHectare: null, // calculado após acumular todas as linhas
      temBase: (entrada?.temBase ?? false) || pesoParcial !== null,
    })
  }

  // Calcula prodHectare com os totais finais e ordena: maior → menor (null = 0)
  return Array.from(mapa.values())
    .map((item) => ({
      ...item,
      prodHectare:
        item.pesoTotal !== null && item.hect !== null && item.hect > 0
          ? item.pesoTotal / item.hect
          : null,
    }))
    .sort((a, b) => (b.prodHectare ?? 0) - (a.prodHectare ?? 0))
}

export function ProducaoPorSetor({ linhas, setores, carregando, erro }: Props) {
  const agregados = agregar(linhas, setores)

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
          Produção por Setor
        </h3>
        {!carregando && agregados.length > 0 && (
          <span className="text-xs text-slate-400">
            {agregados.length} {agregados.length === 1 ? 'setor' : 'setores'}
          </span>
        )}
      </div>

      {erro && (
        <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          Carregando...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                  Setor
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                  Total Cachos
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                  Área (ha)
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                  Peso Total (kg)
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider">
                  Prod. / Hectare (kg/ha)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {agregados.map((item, index) => (
                <tr key={item.setor_id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {item.nomeSetor}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    {item.totalCachos.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    {item.hect !== null
                      ? item.hect.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {item.pesoTotal !== null ? kg(item.pesoTotal) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {item.prodHectare !== null ? kg(item.prodHectare) : '—'}
                  </td>
                </tr>
              ))}

              {agregados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Nenhum dado de produção disponível.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
