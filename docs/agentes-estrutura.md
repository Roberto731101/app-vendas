# Estrutura de Agentes Especializados

## 1. Por que agentes especializados

### O problema do contexto único

Um agente geral carregando todo o projeto enfrenta limitações sérias:

- A janela de contexto é consumida com informações irrelevantes para a tarefa atual. Um agente que sabe tudo sobre vendas, estoque, áreas geográficas, autenticação e relatórios ao mesmo tempo acaba com pouca capacidade de raciocínio específico para cada domínio.
- Regras de negócio de módulos diferentes colidem. O agente pode cruzar indevidamente lógica de colheita com lógica de vendas, ou tocar em arquivos de auth ao resolver um bug de estoque.
- A manutenção é frágil. Ao evoluir um módulo, o agente geral pode sugerir alterações em arquivos que não pertencem ao escopo da tarefa.

### Benefício de agentes com escopo delimitado

- Cada agente carrega apenas os arquivos, tabelas e regras do seu domínio.
- O conjunto de arquivos que o agente "não deve tocar" está documentado explicitamente, impedindo contaminação entre módulos.
- O orquestrador pode delegar tarefas ao agente correto sem ambiguidade.
- Agentes menores são mais previsíveis e mais fáceis de testar.

---

## 2. Estrutura de pastas

```
c:\Projetos\app-vendas\
├── CLAUDE.md                    ← instruções globais do projeto (carregadas em toda sessão)
├── AGENTS.md                    ← aviso sobre versão do Next.js (regras de runtime)
├── .claude/
│   └── agents/                  ← um arquivo .md por agente especializado
│       ├── auth-permissoes.md
│       ├── cadastros-base.md
│       ├── colheita-producao.md
│       ├── dashboard-relatorios.md
│       ├── estoque.md
│       ├── gestao-areas.md
│       ├── layout-nav.md
│       ├── organizacional.md
│       ├── testes.md
│       └── vendas.md
└── docs/                        ← documentação do projeto (lida pelo CLAUDE.md)
    ├── agentes-estrutura.md     ← este arquivo
    ├── backlog.md
    ├── decisoes-tecnicas.md
    ├── estrutura-banco.md
    ├── fluxo-telas.md
    ├── padroes.md
    ├── permissoes-modulos-acoes.md
    ├── projeto.md
    ├── protocolo-projeto.md
    ├── regras-negocio.md
    └── vendas.md
```

### Convenção de nomes de arquivos

- Arquivos em `.claude/agents/` usam kebab-case, descrevendo o domínio coberto (ex: `auth-permissoes.md`, `gestao-areas.md`).
- O campo `name:` no frontmatter corresponde exatamente ao nome do arquivo sem extensão.
- Cada arquivo começa com frontmatter YAML seguido do corpo em Markdown.

---

## 3. Lista de todos os agentes criados

### auth-permissoes

- **Nome**: `auth-permissoes`
- **Modelo**: `claude-sonnet-4-6`
- **Domínio**: Autenticação via Supabase Auth, sessão em cookies (@supabase/ssr), sistema de permissões por módulo (pode_ver/pode_criar/pode_editar/pode_excluir), proteção de rotas via proxy.ts, estado global de sessão.
- **Arquivos cobertos**:
  - `lib/auth.ts`, `lib/permissoes.ts`, `lib/permissaoHelper.ts`
  - `hooks/useAuth.ts`
  - `contexts/AuthContext.tsx`
  - `proxy.ts`
  - `app/login/page.tsx`
- **Quando invocar**: Login/logout com problemas, adicionar novo módulo ao enum MODULOS, alterar a cadeia de permissão (proxy → useAuth → AuthContext), corrigir guards de acesso, investigar redirecionamentos para /login.

---

### cadastros-base

- **Nome**: `cadastros-base`
- **Modelo**: `claude-haiku-4-5-20251001`
- **Domínio**: CRUD dos cadastros auxiliares consumidos por outros módulos — produtos, classificações de fruta, tipos de caixa e setores. Sem guards de permissão (acesso irrestrito a usuários logados).
- **Arquivos cobertos**:
  - `hooks/useProdutos.ts`, `hooks/useClassificacoes.ts`, `hooks/useTiposCaixa.ts`, `hooks/useSetores.ts`
  - `components/classificacoes/`, `components/produtos/`, `components/tipos-caixa/`, `components/setores/`
  - `app/classificacoes/`, `app/produtos/`, `app/tipos-caixa/`, `app/setores/`
- **Quando invocar**: Adicionar campo a produto ou classificação, corrigir CRUD de tipos de caixa, criar nova opção de cadastro auxiliar, resolver bug em formulário de setor.

---

### colheita-producao

- **Nome**: `colheita-producao`
- **Modelo**: `claude-sonnet-4-6`
- **Domínio**: Lotes de campo, registro de colheita, cálculo de peso efetivo de cachos, produção por setor, resumo por lote. Hierarquia de leitura: Fazenda → Área → Setor → Lote → Colheita.
- **Arquivos cobertos**:
  - `hooks/useLoteForm.ts`, `hooks/useLotes.ts`, `hooks/useColheitaForm.ts`, `hooks/useColheitasHistorico.ts`, `hooks/useProducaoPorSetor.ts`, `hooks/useResumoPorLote.ts`
  - `components/lotes/`, `components/colheita/`
  - `app/lotes/`, `app/colheita/`
  - `types/colheita.ts`, `types/lote.ts`
  - `lib/pesoCachoEfetivo.ts`
- **Quando invocar**: Registrar colheita, criar ou editar lote, corrigir cálculo de peso efetivo, gerar produção por setor, resolver bugs no histórico de colheitas.

---

### dashboard-relatorios

- **Nome**: `dashboard-relatorios`
- **Modelo**: `claude-sonnet-4-6`
- **Domínio**: Dashboard analítico (gráficos Recharts), relatório de produção por setor, relatório de vendas por lote, consolidado, exportação CSV e impressão PDF via window.print(). Apenas lê dados dos demais módulos, nunca os escreve.
- **Arquivos cobertos**:
  - `hooks/useDashboardProducao.ts`, `hooks/useDashboardVendas.ts`, `hooks/useRelatorios.ts`
  - `components/dashboard/` (8 componentes de gráfico)
  - `components/relatorios/` (RelatorioHeader, RelatorioProducaoPorSetor, RelatorioVendasPorLote, RelatorioConsolidado, RelatorioColheitaPorLote)
  - `app/dashboard/page.tsx`, `app/relatorios/page.tsx`, `app/relatorios/print.css`
  - `lib/exportarCSV.ts`
- **Quando invocar**: Adicionar novo gráfico, corrigir filtros do relatório, ajustar layout de impressão PDF, exportar CSV de um novo conjunto de dados.

---

### estoque

- **Nome**: `estoque`
- **Modelo**: `claude-sonnet-4-6`
- **Domínio**: Insumos agrícolas, categorias de insumos, movimentações de estoque (entrada/saída), saldo atual, alertas de nível crítico/alerta, validação de saldo negativo.
- **Arquivos cobertos**:
  - `hooks/useCategorias.ts`, `hooks/useInsumos.ts`, `hooks/useMovimentacoes.ts`
  - `components/estoque/` (AlertaCritico, CategoriaPill, EstoqueResumoCards, InsumoCard, InsumoTable, MovimentacaoForm, MovimentacaoHistorico, StatusBadge)
  - `app/estoque/`, `app/estoque/insumos/`, `app/estoque/movimentar/`, `app/estoque/categorias/`
- **Quando invocar**: Registrar movimentação de insumo, criar categoria, corrigir cálculo de status (ok/alerta/critico), validar saída sem saldo negativo, exibir histórico de movimentações.

---

### gestao-areas

- **Nome**: `gestao-areas`
- **Modelo**: `claude-sonnet-4-6`
- **Domínio**: Hierarquia Fazenda → Área → Setor, polígonos geográficos (jsonb), safras, cotas de insumos por área, status de saúde da área, mapas Google Maps com AdvancedMarker e DrawingManager.
- **Arquivos cobertos**:
  - `hooks/useFazendas.ts`, `hooks/useAreas.ts`, `hooks/useSetores.ts`, `hooks/useGestaoAreas.ts`, `hooks/useSafras.ts`, `hooks/useCotasArea.ts`
  - `components/areas/`, `components/fazendas/`, `components/maps/`, `components/home/`
  - `app/page.tsx`, `app/fazendas/`, `app/areas/`, `app/setores/`
- **Quando invocar**: Exibir mapa da propriedade, editar polígono de área, criar safra, configurar cota de insumo por área, corrigir status de saúde da área, resolver problemas com lat/lng.

---

### layout-nav

- **Nome**: `layout-nav`
- **Modelo**: `claude-haiku-4-5-20251001`
- **Domínio**: Sidebar de navegação (hierarquia NavSection → NavGroup → NavItem), controle de visibilidade por permissão no menu, AppHeader (avatar, nome, cargo, dropdown), tema visual global.
- **Arquivos cobertos**:
  - `lib/nav.ts`
  - `components/layout/Sidebar.tsx`
  - `components/layout/AppLayout.tsx`
  - `components/layout/AppHeader.tsx`
- **Quando invocar**: Adicionar item ou seção ao menu, alterar agrupamento da sidebar, mudar cor do tema, ajustar o header (avatar ou botão de logout), corrigir visibilidade de item por permissão.

---

### organizacional

- **Nome**: `organizacional`
- **Modelo**: `claude-sonnet-4-6`
- **Domínio**: Módulo administrativo — usuários, departamentos, cargos, funções. Hierarquia Departamento → Cargo → Função → Usuário. Guards de permissão por ação (podeAcessar/podeCriar/podeEditar) já implementados. Inativação com validação de dependências.
- **Arquivos cobertos**:
  - `app/usuarios/page.tsx`
  - `app/departamentos/page.tsx`
  - `app/cargos/page.tsx`
  - `app/funcoes/page.tsx`
- **Quando invocar**: Adicionar campo ao cadastro de usuário, corrigir regra de inativação de cargo/função, adicionar guard de permissão a uma das 4 pages, resolver bug de integridade referencial no organograma.

---

### testes

- **Nome**: `testes`
- **Modelo**: `claude-haiku-4-5-20251001`
- **Domínio**: Checklists de teste, planos de validação e QA. Lê código e documentação para produzir artefatos de teste. Nunca altera código de produção.
- **Arquivos cobertos** (escrita restrita a):
  - `docs/*.md`
- **Quando invocar**: Criar checklist de permissões por perfil de usuário, documentar casos de teste de um módulo, gerar roteiro de validação manual, registrar pendências de QA.

---

### vendas

- **Nome**: `vendas`
- **Modelo**: `claude-sonnet-4-6`
- **Domínio**: Cabeçalho de venda, itens da venda, cálculos automáticos (PesoTotal/ValorTotal), auditoria de alterações, histórico de vendas com filtros.
- **Arquivos cobertos**:
  - `hooks/useVendaForm.ts`, `hooks/useVendasHistorico.ts`, `hooks/useVendaAuditoria.ts`
  - `components/vendas/` (VendaInfoForm, ItemVendaForm, ItensVendaTable, VendaResumo, VendaAuditoria)
  - `app/vendas/page.tsx`, `app/vendas/[id]/page.tsx`
  - `types/venda.ts`, `types/venda-form.ts`, `types/item-venda.ts`
  - `lib/utils/calcularVenda.ts`
- **Quando invocar**: Criar ou editar venda, corrigir cálculo de peso/valor, adicionar campo ao item da venda, ajustar histórico com novo filtro, inspecionar auditoria de venda.

---

## 4. Como invocar agentes

### Via `@agent-nome` no chat

No Claude.ai ou em qualquer interface que suporte menções:

```
@vendas adicione o campo desconto_percentual ao item da venda
@auth-permissoes o proxy.ts não está redirecionando para /login corretamente
@layout-nav adicione o item "PDCA" na seção Operacional do menu
```

### Via flag `--agent` no CLI

```bash
claude --agent auth-permissoes "altere o carregarPermissoes para incluir o módulo pdca"
claude --agent testes "gere checklist de permissões para o módulo estoque"
```

### Delegação automática pelo orquestrador (Agent tool)

O agente orquestrador (sessão principal) pode delegar subtarefas ao agente correto usando a ferramenta `Agent`. O orquestrador descreve a tarefa e o sistema seleciona o agente com base no campo `description:` do frontmatter.

O campo `description:` de cada agente é deliberadamente descritivo e inclui palavras-chave do domínio para facilitar a seleção automática. Exemplo:

```yaml
description: Especialista em autenticação Supabase, sessão via cookies,
  sistema de permissões por módulo... Use este agente quando a tarefa
  envolver login, logout, permissões, guards de acesso...
```

---

## 5. Memória persistente

### Onde fica

```
C:\Users\Admin\.claude\projects\c--Projetos-app-vendas\memory\
```

Diretório gerenciado pelo Claude Code CLI. Cada arquivo de memória é um documento Markdown com frontmatter estruturado.

### Formato esperado

```markdown
---
type: project | user | feedback | reference
title: Título curto descritivo
tags: [tag1, tag2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

Corpo em Markdown com as informações persistidas.
```

### Tipos de memória

| Tipo | Uso |
|---|---|
| `project` | Decisões técnicas, estado atual de módulos, migrations aplicadas |
| `user` | Preferências do desenvolvedor, padrões de trabalho |
| `feedback` | Correções e ajustes solicitados pelo desenvolvedor |
| `reference` | Tabelas de referência rápida (ex: mapeamento módulo → arquivo) |

### Como o MEMORY.md funciona como índice

Quando presente, o arquivo `MEMORY.md` na raiz do diretório de memória serve como índice de todos os arquivos de memória existentes. Cada agente é responsável por registrar nele as mudanças relevantes ao seu domínio ao finalizar uma tarefa. Isso evita que informações importantes se percam entre sessões.

Atualmente o diretório de memória existe mas está vazio — nenhum registro foi persistido ainda.

---

## 6. Padrão de criação de novos agentes

### Template de frontmatter completo

```
---
name: nome-do-agente
description: >
  Descrição detalhada do domínio. Inclua palavras-chave que um orquestrador
  usaria para identificar que esta tarefa pertence a este agente. Inclua
  exemplos de "use este agente quando...".
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---
```

Campos obrigatórios: `name`, `description`, `model`, `tools`.

Para agentes de leitura/documentação (como `testes`), omitir `Bash` e `Write` se o agente não precisar criar arquivos fora de `docs/`.

Para agentes simples de CRUD sem lógica complexa, preferir `claude-haiku-4-5-20251001` (mais rápido e econômico). Para agentes com lógica de negócio ou raciocínio multi-etapa, usar `claude-sonnet-4-6`.

### Boas práticas ao criar um novo agente

**Escopo delimitado**: Liste explicitamente os arquivos que o agente pode editar. Ambiguidade no escopo causa contaminação entre módulos.

**Seção "O que este agente NÃO deve tocar"**: Tão importante quanto o escopo positivo. Evite que o agente resolva o problema errado no arquivo errado.

**Regras de negócio**: Inclua as regras críticas do domínio diretamente no corpo do agente, não apenas links para docs. O agente precisa das regras no contexto.

**Banco de dados relevante**: Liste as tabelas com seus campos principais e FKs. O agente precisa saber o esquema do domínio.

**Memória persistente**: Defina o que deve ser registrado em memória ao finalizar uma mudança. Sem isso, decisões importantes se perdem entre sessões.

**Padrões visuais** (quando aplicável): Se o módulo tem paleta própria ou padrão de componentes, documente no agente para manter consistência.

---

## 7. Lições aprendidas

### Trabalhar em passes sequenciais

Tarefas complexas funcionam melhor divididas em passes:

1. **Pesquisar**: O agente lê os arquivos relevantes para entender o estado atual.
2. **Planejar**: O agente descreve o que vai alterar antes de escrever.
3. **Implementar**: O agente realiza as mudanças com escopo controlado.
4. **Verificar**: O agente confirma que os arquivos alterados estão consistentes.

Evitar fazer pesquisa e implementação no mesmo passo reduz erros de contexto parcial.

### Domínio pequeno e bem definido é mais eficaz

Agentes com escopo amplo tendem a propor soluções que tocam arquivos além do necessário. O agente `layout-nav`, por exemplo, nunca deve alterar `lib/permissoes.ts` — mesmo que a tarefa pareça relacionada a navegação com permissões. A fronteira clara força o desenvolvedor a chamar o agente correto e mantém a responsabilidade de cada domínio explícita.

### Memória persistente evita retrabalho entre sessões

Sem memória, cada nova sessão começa do zero. O agente não sabe que `classificacoes` foi deliberadamente deixado sem guards de permissão, ou que `status_estoque` tem fórmula específica com multiplicador 1.2. Registrar essas decisões em memória evita que o agente "corrija" algo que foi decidido assim intencionalmente.

### Testes de agentes: verificar se o agente realmente segue o escopo

Ao criar um novo agente, testar com uma tarefa que cruzaria a fronteira de domínio. Por exemplo: pedir ao agente `vendas` para ajustar o menu da sidebar. O agente deve recusar ou indicar que aquela tarefa pertence ao agente `layout-nav`. Se o agente simplesmente executar a tarefa fora do seu domínio, a seção "O que este agente NÃO deve tocar" precisa ser reforçada.

### AGENTS.md como camada de aviso de runtime

O arquivo `AGENTS.md` na raiz do projeto não descreve agentes especializados — ele serve para avisos de ambiente que se aplicam a qualquer agente ou sessão. No projeto atual, ele alerta que a versão do Next.js em uso tem breaking changes e que os agentes devem ler os guias em `node_modules/next/dist/docs/` antes de escrever código de roteamento.
