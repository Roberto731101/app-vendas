export type Venda = {
  id: number
  created_at: string
  lote_id: number | null
  data_venda: string | null
  ordem_venda: string
  cliente: string
  observacao: string | null
  finalizada: boolean
}

export type LoteOpcao = {
  id: number
  codigo: string
}

export type ItemVenda = {
  id: number
  venda_id: number
  produto: string
  tipo_caixa: string
  classificacao: string
  qtd_caixas: number
  kg_por_caixa: number
  valor_kg: number
  peso_total: number
  valor_total: number
  created_at: string
}

export type Cliente = {
  id: number
  nome: string
  ativo: boolean
}

export type Produto = {
  id: number
  nome: string
  ativo: boolean
}

export type TipoCaixa = {
  id: number
  nome: string
  peso_padrao: number | null
  ativo: boolean
}

export type Classificacao = {
  id: number
  nome: string
  ativo: boolean
}
