-- ============================================================
-- Migration: Avaliação de Campo - Fazenda São Jorge
-- Data: 2026-04-25
-- Fonte da verdade dos nomes: quadras.geojson (EPSG:31984)
--
-- DIAGNÓSTICO PRÉ-EXECUÇÃO (verificado via API em 2026-04-25):
--
--   area_id=6  → Area01 / fazenda_id=1  → Quadras 01-06
--   area_id=8  → Área01 / fazenda_id=2  → Quadras A, E, F, G, H, I, PN
--   area_id=9  → Área02 / fazenda_id=2  → Quadras B, C, 07-13
--
--   id=50 (QD-E): 0 FKs ativas → DELETE direto
--   id=38 (nome="6"): 5 registros em controle_colheita (ids 32,42,48,54,65
--                     de 2021, lotes 9/12/13/15) → ver PASSO 1c abaixo
--   Quadra D: não existe no banco; area_id deixado NULL (ver PASSO 1d)
-- ============================================================


-- ============================================================
-- PASSO 1a — Renomear setores (padrão "Quadra X" = GeoJSON)
-- ============================================================

-- Letradas com prefixo QD-
UPDATE setores SET nome = 'Quadra A'  WHERE nome = 'QD-A';
UPDATE setores SET nome = 'Quadra B'  WHERE nome = 'QD-B';
UPDATE setores SET nome = 'Quadra C'  WHERE nome = 'QD-C';
UPDATE setores SET nome = 'Quadra F'  WHERE nome = 'QD-F';

-- Sufixo "5" removido
UPDATE setores SET nome = 'Quadra G'  WHERE nome = 'G5';
UPDATE setores SET nome = 'Quadra H'  WHERE nome = 'H5';
UPDATE setores SET nome = 'Quadra I'  WHERE nome = 'I5';

-- Sem prefixo/sufixo
UPDATE setores SET nome = 'Quadra PN' WHERE nome = 'PN';

-- Quadra E (manter id=27, area_id=8)
UPDATE setores SET nome = 'Quadra E'  WHERE id = 27;

-- Numéricas com zero à esquerda
UPDATE setores SET nome = 'Quadra 01' WHERE id = 33;  -- era "1",  area_id=6
UPDATE setores SET nome = 'Quadra 02' WHERE id = 34;  -- era "2",  area_id=6
UPDATE setores SET nome = 'Quadra 03' WHERE id = 35;  -- era "3",  area_id=6
UPDATE setores SET nome = 'Quadra 04' WHERE id = 36;  -- era "4",  area_id=6
UPDATE setores SET nome = 'Quadra 05' WHERE id = 37;  -- era "5",  area_id=6
UPDATE setores SET nome = 'Quadra 07' WHERE id = 39;  -- era "7",  area_id=9
UPDATE setores SET nome = 'Quadra 08' WHERE id = 40;  -- era "8",  area_id=9
UPDATE setores SET nome = 'Quadra 09' WHERE id = 41;  -- era "9",  area_id=9
UPDATE setores SET nome = 'Quadra 10' WHERE id = 42;  -- era "10", area_id=9
UPDATE setores SET nome = 'Quadra 11' WHERE id = 43;  -- era "11", area_id=9
UPDATE setores SET nome = 'Quadra 12' WHERE id = 44;  -- era "12", area_id=9
UPDATE setores SET nome = 'Quadra 13' WHERE id = 45;  -- era "13", area_id=9


-- ============================================================
-- PASSO 1b — Deletar duplicata Quadra E (id=50)
-- Diagnóstico: 0 FKs em controle_colheita, movimentacoes_estoque
--              e cotas_insumos_area → DELETE seguro
-- ============================================================

DELETE FROM setores WHERE id = 50;  -- era "QD-E", area_id=9


-- ============================================================
-- PASSO 1c — Quadra 06 (id=38): não existe fisicamente
--
-- Opção A confirmada em 2026-04-25:
--   Apagar os 5 registros históricos de colheita (jan/2021) + apagar o setor.
--   ids removidos de controle_colheita: 32, 42, 48, 54, 65
-- ============================================================

DELETE FROM controle_colheita WHERE setor_id = 38;
DELETE FROM setores            WHERE id       = 38;


-- ============================================================
-- PASSO 1d — Inserir Quadra D
--
-- Existe no GeoJSON (fid=4) mas não no banco.
-- area_id = NULL: não foi possível determinar com segurança
--   qual área corresponde (D está geograficamente entre C e E/F,
--   que pertencem a áreas distintas — área 9 e área 8).
--   Ajuste manualmente após confirmar com o responsável técnico.
-- ============================================================

INSERT INTO setores (nome, numero, hect, descricao, area_id)
VALUES (
  'Quadra D',
  0,
  NULL,
  'Criado via migration-avaliacao — polígono vem do QGIS. area_id pendente de confirmação.',
  NULL
);


-- ============================================================
-- PASSO 2 — Tabela linhas_producao
-- 723 linhas do GeoJSON; cada linha = 1 beca avaliável
-- ============================================================

CREATE TABLE IF NOT EXISTS linhas_producao (
  id          bigserial PRIMARY KEY,
  setor_id    int8      NOT NULL REFERENCES setores(id),
  numero      int       NOT NULL,
  codigo      text      NOT NULL,      -- ex: "Quadra A/1"
  geojson     jsonb,                   -- LineString EPSG:31984
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linhas_producao_setor
  ON linhas_producao (setor_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_linhas_producao_codigo
  ON linhas_producao (codigo);


-- ============================================================
-- PASSO 3 — Tabela avaliacoes
-- Uma avaliação por beca por dia; usuario_id opcional
-- ============================================================

CREATE TABLE IF NOT EXISTS avaliacoes (
  id              bigserial PRIMARY KEY,
  linha_id        int8  NOT NULL REFERENCES linhas_producao(id),
  data_avaliacao  date  NOT NULL,
  usuario_id      int8  REFERENCES usuarios(id),  -- NULL permitido
  status          int   NOT NULL DEFAULT 1
                        CHECK (status IN (1, 2, 3)),
                        -- 1 = não realizado
                        -- 2 = em andamento
                        -- 3 = ok
  observacao      text,
  created_at      timestamptz DEFAULT now(),

  UNIQUE (linha_id, data_avaliacao)
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_data  ON avaliacoes (data_avaliacao);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_linha ON avaliacoes (linha_id);


-- ============================================================
-- VERIFICAÇÃO PÓS-MIGRATION
-- ============================================================

SELECT id, nome, area_id
FROM   setores
WHERE  nome LIKE 'Quadra%'
ORDER  BY nome;
