// Tipo correspondente à tabela lotes_fechamento no Supabase.
// Colunas existentes: id, codigo, data_referencia, observacao, created_at
export type Lote = {
  id: number
  created_at: string
  codigo: string           // exibido como "Nome" no formulário
  data_referencia: string | null
  observacao: string | null
}

export type LoteInsert = Omit<Lote, 'id' | 'created_at'>
