import type { Insumo } from '@/hooks/useInsumos'
import { CategoriaPill } from './CategoriaPill'

type Props = {
  insumo: Insumo
}

function fmtData(iso: string | null): string {
  if (!iso) return 'Não informada'
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

type ItemEspecProps = {
  icone: string
  rotulo: string
  valor: React.ReactNode
}

function ItemEspec({ icone, rotulo, valor }: ItemEspecProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
      <span className="mt-0.5 text-xl leading-none">{icone}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{rotulo}</p>
        <div className="mt-1 text-sm font-semibold text-slate-800">{valor}</div>
      </div>
    </div>
  )
}

export function InsumoEspecificacoes({ insumo }: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
        Especificações Técnicas
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ItemEspec
          icone="🏭"
          rotulo="Fabricante / Fornecedor"
          valor={insumo.marca_fornecedor ?? 'Não informado'}
        />
        <ItemEspec
          icone="📅"
          rotulo="Validade"
          valor={fmtData(insumo.data_validade)}
        />
        <ItemEspec
          icone="🔖"
          rotulo="Lote"
          valor={insumo.lote ?? 'Não informado'}
        />
        <ItemEspec
          icone="📦"
          rotulo="Categoria"
          valor={
            insumo.nome_categoria ? (
              <CategoriaPill nome={insumo.nome_categoria} tipo={insumo.tipo_categoria} />
            ) : (
              <span className="text-slate-400">Sem categoria</span>
            )
          }
        />
        <ItemEspec
          icone="⚖️"
          rotulo="Unidade de Medida"
          valor={insumo.unidade}
        />
        <ItemEspec
          icone="⚠️"
          rotulo="Estoque Mínimo"
          valor={
            <span>
              {insumo.estoque_minimo.toLocaleString('pt-BR')}{' '}
              <span className="text-xs font-normal text-slate-400">{insumo.unidade}</span>
            </span>
          }
        />
      </div>
    </div>
  )
}
