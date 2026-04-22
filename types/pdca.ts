// ── Enums ────────────────────────────────────────────────────────────────────

export type PdcaFase =
  | 'planejar'
  | 'executar'
  | 'verificar'
  | 'agir'
  | 'concluido'

export type PdcaStatus =
  | 'a_fazer'
  | 'em_progresso'
  | 'concluido'
  | 'cancelado'

export type PdcaPrioridade =
  | 'baixa'
  | 'media'
  | 'alta'

export type PdcaTipoObservacao =
  | 'observacao'
  | 'cancelamento'
  | 'oportunidade'

// ── Entidades principais ─────────────────────────────────────────────────────

export type PdcaCiclo = {
  id:                number
  titulo:            string
  descricao:         string | null
  fase_atual:        PdcaFase
  data_inicio:       string | null
  data_fim_prevista: string | null
  criado_por:        number | null
  // join opcional
  criado_por_nome:   string | null
  created_at:        string
  updated_at:        string | null
}

export type PdcaTarefa = {
  id:          number
  ciclo_id:    number
  titulo:      string
  descricao:   string | null
  // delegação estrutural
  cargo_id:    number
  cargo_nome:  string | null
  // executor real (atribuído na fase Executar)
  executor_id: number | null
  executor_nome: string | null
  // kanban
  status:      PdcaStatus
  prioridade:  PdcaPrioridade
  prazo:                string | null
  data_inicio_prevista: string | null
  data_fim_prevista:    string | null
  ordem:                number
  // localização opcional
  fazenda_id:  number | null
  fazenda_nome: string | null
  area_id:     number | null
  area_nome:   string | null
  setor_id:    number | null
  setor_nome:  string | null
  created_at:  string
  updated_at:  string | null
}

export type PdcaObjetivo = {
  id:           number
  ciclo_id:     number
  descricao:    string
  metrica_base: string | null
  metrica_alvo: string | null
  created_at:   string
}

export type PdcaObservacao = {
  id:         number
  ciclo_id:   number
  tarefa_id:  number | null
  tipo:       PdcaTipoObservacao
  descricao:  string
  criado_por: number
  // join opcional
  criado_por_nome: string | null
  created_at: string
}

// ── Tipos de insert (sem id e timestamps gerados pelo banco) ─────────────────

export type PdcaCicloInsert = Omit<PdcaCiclo,
  'id' | 'criado_por_nome' | 'created_at' | 'updated_at'>

export type PdcaTarefaInsert = Omit<PdcaTarefa,
  'id' | 'cargo_nome' | 'executor_nome' | 'fazenda_nome' | 'area_nome' | 'setor_nome' | 'created_at' | 'updated_at'>

export type PdcaObjetivoInsert = Omit<PdcaObjetivo,
  'id' | 'created_at'>

export type PdcaObservacaoInsert = Omit<PdcaObservacao,
  'id' | 'criado_por_nome' | 'created_at'>
