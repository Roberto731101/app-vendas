export type ItemVenda = {
  id: string
  venda_id: string
  produto_id: string
  tipo_caixa_id: string
  classificacao: string
  qtd_caixas: number
  kg_por_caixa: number
  valor_kg: number
  peso_total: number
  valor_total: number
  created_at?: string
}