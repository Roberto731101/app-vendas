# Backlog do Projeto

## Concluído
- ✅ Gestão de Áreas com Google Maps + Cotas por Safra (2026-04-20)
  - hooks/useSafras.ts, useCotasArea.ts, useGestaoAreas.ts criados
  - components/maps/MapaAreas.tsx (polígonos por status, InfoWindow, legenda)
  - components/maps/EditorPoligono.tsx (DrawingManager para desenhar polígonos)
  - components/areas: AreaCard, AlertasCriticos, CotaInsumoRow, CotaForm, SafraSelect
  - /areas (painel 40/60: lista+alertas à esquerda, mapa à direita)
  - /areas/[id] (detalhe: mapa, editor polígono, cotas, histórico)
  - /areas/safras (CRUD de safras)
  - Dependência: @vis.gl/react-google-maps
  - Variável: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  - SQL: safras, cotas_insumos_area, campos lat/lng/poligono
- ✅ Autenticação com Supabase Auth (2026-04-20)
  - @supabase/ssr instalado (sessão em cookies)
  - lib/auth.ts: signIn, signOut, getSession, getUser
  - hooks/useAuth.ts: estado global de sessão + perfil
  - contexts/AuthContext.tsx: provider + useAuthContext
  - app/login/page.tsx: tela de login com toggle senha
  - proxy.ts: proteção de todas as rotas (redireciona para /login)
  - AppHeader.tsx: avatar + nome + cargo + dropdown Sair
  - Sidebar.tsx: card do usuário logado no rodapé + botão Sair
  - useMovimentacoes.ts: usuario_id auto-injetado no registrar
  - MovimentacaoHistorico.tsx: responsável exibido em cada card
  - SQL: auth_id em usuarios, usuario_id em movimentacoes_estoque
- ✅ Módulo de Estoque — Gerencial/Estoque (2026-04-20)
  - useCategorias.ts, useInsumos.ts, useMovimentacoes.ts criados
  - 8 componentes em /components/estoque
  - 4 telas: /estoque, /estoque/insumos, /estoque/movimentar, /estoque/categorias
  - Sidebar refatorada para grupos independentes
  - lib/nav.ts com grupo Estoque
  - Status calculado automaticamente (ok/alerta/critico)
  - Validação de saldo negativo na saída
  - Bloqueio de exclusão em cascata (categoria→insumo, insumo→movimentação)
- ✅ Melhoria do Relatório + Exportação PDF (2026-04-20)
  - RelatorioProducaoPorSetor simplificado (7 colunas, sem Ratio/Origem/Peso Obtido)
  - Totalizadores adicionados em Produção por Setor e Consolidado por Lote
  - Cabeçalho NOLASCO PRODUÇÃO com filtros aplicados e data de geração (RelatorioHeader)
  - Exportar PDF via window.print() integrado ao dropdown Exportar
  - print.css criado em app/relatorios/ (A4, rodapé com página, oculta nav/filtros/botões)
- ✅ Cadastro hierárquico Fazenda → Área → Setor (2026-04-19)
  - Hook useAreas.ts criado
  - useFazendas.ts com join completo (buscarTodasComHierarquia)
  - useSetores.ts com area_id
  - AreaForm.tsx criado
  - HierarquiaView.tsx criado
  - /fazendas/page.tsx refatorado com layout em duas colunas
  - Regras: bloqueio de exclusão em cascata

## Próximo passo: Relatórios
- Relatório de produção por fazenda/área/setor
- Relatório de vendas por período
- Exportação para Excel/CSV
- Integração com Power BI

## Prioridade alta
- Estruturar cadastro de vendas
- Estruturar cadastro de itens
- Validar cálculos
- Organizar componentes

## Prioridade média
- Filtros de consulta
- Melhorar layout
- Padronizar mensagens

## Prioridade futura
- Dashboard
- Exportação
- Integração com Power BI
- Controle de permissões
