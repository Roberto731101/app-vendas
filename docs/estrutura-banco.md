# Estrutura do Banco

## Hierarquia: Fazenda → Área → Setor

```
fazendas
  └─ areas (fazenda_id FK)
       └─ setores (area_id FK)
```

## Tabela: fazendas
- id
- nome
- descricao
- created_at

## Tabela: areas
- id
- fazenda_id (FK → fazendas.id)
- numero (texto, ex: "Area01")
- nome
- descricao
- created_at

## Tabela: setores
- id
- area_id (FK → areas.id) ← adicionado via migration
- numero (int)
- nome
- hect (decimal, hectares)
- descricao
- created_at

## Migração aplicada (2026-04-19)
```sql
ALTER TABLE areas RENAME COLUMN "Nome" TO nome;
ALTER TABLE setores ADD COLUMN area_id int8 REFERENCES areas(id);
```

---

## Tabela: vendas
Campos sugeridos:
- id
- ordem_venda
- data_venda
- cliente_id
- observacao
- created_at

## Tabela: vendas_itens
Campos sugeridos:
- id
- venda_id
- produto_id
- tipo_caixa_id
- classificacao
- qtd_caixas
- kg_por_caixa
- valor_kg
- peso_total
- valor_total
- created_at

## Tabela: clientes
Campos sugeridos:
- id
- nome
- documento
- cidade
- created_at

## Tabela: produtos
Campos sugeridos:
- id
- nome
- ativo

## Tabela: tipos_caixa
Campos sugeridos:
- id
- descricao
- ativo

---

## Módulo de Estoque

### Tabela: categorias_insumos
- id
- nome_categoria
- descricao
- tipo (text: fertilizante | defensivo | semente | outros)
- ativo (bool)
- created_at, updated_at

### Tabela: insumos
- id
- nome_insumo
- categoria_id (FK → categorias_insumos.id)
- marca_fornecedor
- unidade (kg | L | un | cx | sc | t)
- quantidade_atual (numeric)
- estoque_minimo (numeric)
- lote
- data_validade (date)
- status_estoque (calculado: ok | alerta | critico)
- ativo (bool)
- created_at, updated_at

### Tabela: usuarios
- id
- nome
- email
- cargo
- funcao
- departamento
- auth_id (uuid FK → auth.users.id) ← adicionado em 2026-04-20
- created_at

### Tabela: movimentacoes_estoque
- id
- insumo_id (FK → insumos.id)
- tipo_movimentacao ('entrada' | 'saida')
- quantidade (numeric)
- unidade
- data_movimentacao (date)
- fazenda_id (FK → fazendas.id)
- area_id (FK → areas.id)
- setor_id (FK → setores.id)
- usuario_id (uuid FK → auth.users.id) ← adicionado em 2026-04-20
- observacao
- created_at

---

## Módulo de Gestão de Áreas (2026-04-20)

### Campos geográficos adicionados

```sql
ALTER TABLE fazendas ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE fazendas ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS poligono jsonb;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE setores ADD COLUMN IF NOT EXISTS poligono jsonb;
ALTER TABLE setores ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE setores ADD COLUMN IF NOT EXISTS lng numeric;
```

### Tabela: safras
- id
- nome
- data_inicio (date)
- data_fim (date)
- ativo (bool)
- created_at

### Tabela: cotas_insumos_area
- id
- area_id (FK → areas.id)
- insumo_id (FK → insumos.id)
- safra_id (FK → safras.id)
- quantidade_cota (numeric)
- unidade (text)
- observacao (text)
- created_at, updated_at
- UNIQUE(area_id, insumo_id, safra_id)

### Regras de cota
- status ok      → consumido < 80% da cota
- status alerta  → consumido >= 80% e < 100%
- status critico → consumido >= 100%

### Saúde da área
- excelente → sem alertas nem críticos
- estavel   → tem alertas, sem críticos
- critico   → tem pelo menos um crítico

### Regras de status calculado
- ok      → quantidade_atual > estoque_minimo * 1.2
- alerta  → quantidade_atual <= estoque_minimo * 1.2 (e > mínimo)
- critico → quantidade_atual <= estoque_minimo
