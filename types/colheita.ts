export type Fazenda = {
  id: number
  nome: string
  descricao: string | null
}

export type Setor = {
  id: number
  area_id: number
  numero: number
  nome: string
  hect: number | null
  descricao: string | null
}

export type Lote = {
  id: number
  codigo: string
  data_referencia: string | null
  observacao: string | null
}

export type Colheita = {
  id: number
  created_at: string
  lote_id: number | null
  setor_id: number
  data_colheita: string
  numero_cachos: number
  amostra_peso_cacho: number | null
  observacao: string | null
}
