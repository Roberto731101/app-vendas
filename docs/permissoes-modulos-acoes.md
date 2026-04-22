# Sistema de Permissoes - Modulos e Acoes

## 1. Visao Geral do Modelo

O sistema de permissoes segue uma cadeia de dependencias do banco ate a interface:

```
auth.users (Supabase Auth)
    |
    | auth_id
    v
usuarios (tabela publica)
    |
    | funcao_id
    v
funcoes
    |
    | id (referenciado em permissoes_funcao.funcao_id)
    v
permissoes_funcao ─── modulo_id ──> modulos_sistema
    |
    | pode_ver, pode_criar, pode_editar, pode_excluir
    v
Permissoes (objeto indexado por chave do modulo, em memoria)
    |
    v
useAuth (hook) → carregarPermissoes(funcaoId)
    |
    v
AuthContext (provider global)
    |
    v
useAuthContext() em page.tsx
    |
    | podeAcessar(modulo), podeCriar(modulo), podeEditar(modulo), podeExcluir(modulo)
    v
Guards condicionais na UI
```

### Resumo do fluxo em texto

1. O usuario se autentica via Supabase Auth (`auth.users`).
2. O hook `useAuth` busca o perfil em `usuarios` usando `auth_id`.
3. Se o usuario tiver `funcao_id`, o hook chama `carregarPermissoes(funcaoId)`.
4. `carregarPermissoes` consulta `permissoes_funcao` com join em `modulos_sistema` e retorna um objeto `Permissoes` indexado pela chave do modulo.
5. Esse objeto e disponibilizado via `AuthContext` para toda a aplicacao.
6. Cada `page.tsx` extrai `podeAcessar`, `podeCriar`, `podeEditar`, `podeExcluir` do contexto e aplica guards condicionais na renderizacao.

---

## 2. Tabelas do Banco

### modulos_sistema

Cadastro dos modulos do sistema que podem ter permissoes controladas.

| Campo | Tipo    | Proposito                                              |
|-------|---------|--------------------------------------------------------|
| id    | integer | Chave primaria                                         |
| chave | text    | Identificador unico do modulo (ex: `usuarios`, `vendas`) usado como indice no objeto de permissoes |

A chave do modulo e o valor que liga o banco ao codigo TypeScript (enum `MODULOS`).

### permissoes_funcao

Registra o conjunto de acoes permitidas para uma funcao em um determinado modulo.

| Campo        | Tipo    | Proposito                                           |
|--------------|---------|-----------------------------------------------------|
| id           | integer | Chave primaria                                      |
| funcao_id    | integer | FK → funcoes.id — qual funcao tem essa permissao    |
| modulo_id    | integer | FK → modulos_sistema.id — a qual modulo se refere   |
| pode_ver     | boolean | Permissao de visualizacao (guard podeAcessar)       |
| pode_criar   | boolean | Permissao de criacao (guard podeCriar)              |
| pode_editar  | boolean | Permissao de edicao (guard podeEditar)              |
| pode_excluir | boolean | Permissao de exclusao (guard podeExcluir)           |

### Exemplo de leitura

Para o usuario com `funcao_id = 2`:

```sql
SELECT
  pf.pode_ver, pf.pode_criar, pf.pode_editar, pf.pode_excluir,
  ms.chave
FROM permissoes_funcao pf
JOIN modulos_sistema ms ON ms.id = pf.modulo_id
WHERE pf.funcao_id = 2;
```

Resultado esperado (exemplo):

| chave      | pode_ver | pode_criar | pode_editar | pode_excluir |
|------------|----------|------------|-------------|--------------|
| usuarios   | true     | false      | false       | false        |
| vendas     | true     | true       | true        | false        |

Em memoria, isso vira o objeto:

```ts
{
  usuarios: { pode_ver: true, pode_criar: false, pode_editar: false, pode_excluir: false },
  vendas:   { pode_ver: true, pode_criar: true,  pode_editar: true,  pode_excluir: false },
}
```

---

## 3. Funcoes de Verificacao

Todas as funcoes de verificacao vivem em `lib/permissoes.ts` e sao wrappers simples sobre o objeto `Permissoes`.

### carregarPermissoes(funcaoId: number): Promise<Permissoes>

Arquivo: `lib/permissoes.ts`

Consulta a tabela `permissoes_funcao` com join em `modulos_sistema` filtrando por `funcao_id`. Normaliza o retorno (o join pode vir como objeto ou array) e retorna um `Record<string, AcaoPermissao>` indexado pela chave do modulo.

Retorna `{}` (objeto vazio) em caso de erro na consulta. Chamada automaticamente por `useAuth` apos carregar o perfil do usuario.

### checarPermissao / podeAcessar

```ts
export function checarPermissao(permissoes: Permissoes | null, modulo: string): boolean
```

Retorna `permissoes[modulo]?.pode_ver`. Se `permissoes` for `null`, retorna `false`.

Exposto no contexto como `podeAcessar(modulo: string): boolean`.

### checarPermissaoCriar / podeCriar

```ts
export function checarPermissaoCriar(permissoes: Permissoes | null, modulo: string): boolean
```

Retorna `permissoes[modulo]?.pode_criar`. Se `permissoes` for `null`, retorna `false`.

Exposto no contexto como `podeCriar(modulo: string): boolean`.

### checarPermissaoEditar / podeEditar

```ts
export function checarPermissaoEditar(permissoes: Permissoes | null, modulo: string): boolean
```

Retorna `permissoes[modulo]?.pode_editar`. Se `permissoes` for `null`, retorna `false`.

Exposto no contexto como `podeEditar(modulo: string): boolean`.

### checarPermissaoExcluir / podeExcluir

```ts
export function checarPermissaoExcluir(permissoes: Permissoes | null, modulo: string): boolean
```

Retorna `permissoes[modulo]?.pode_excluir`. Se `permissoes` for `null`, retorna `false`.

Exposto no contexto como `podeExcluir(modulo: string): boolean`.

### obterPermissaoModulo

```ts
export function obterPermissaoModulo(
  permissoes: Permissoes | null,
  modulo: string
): AcaoPermissao
```

Retorna o objeto `AcaoPermissao` completo para o modulo. Se `permissoes` for `null` ou o modulo nao existir, retorna `permissaoVazia()` (todos os campos `false`).

---

## 4. Enum MODULOS

Definido em `lib/permissoes.ts`. Centraliza todas as chaves de modulo usadas no sistema, evitando strings soltas.

```ts
export const MODULOS = {
  dashboard:      'dashboard',
  vendas:         'vendas',
  colheita:       'colheita',
  relatorios:     'relatorios',
  estoque:        'estoque',
  areas:          'areas',
  pdca:           'pdca',
  tecnica:        'tecnica',
  fazendas:       'fazendas',
  setores:        'setores',
  produtos:       'produtos',
  tipos_caixa:    'tipos_caixa',
  classificacoes: 'classificacoes',
  departamentos:  'departamentos',
  cargos:         'cargos',
  funcoes:        'funcoes',
  usuarios:       'usuarios',
} as const
```

Total: 17 chaves de modulo registradas.

---

## 5. Protecao de Rotas

### Como o proxy.ts funciona

Arquivo: `proxy.ts` (equivalente ao middleware no Next.js 16).

O `proxy` e executado em todas as requisicoes que nao sejam arquivos estaticos (definido pelo `config.matcher`). Ele:

1. Cria um cliente Supabase server-side usando `createServerClient` do `@supabase/ssr`, lendo e escrevendo cookies da requisicao.
2. Chama `supabase.auth.getUser()` para verificar se ha sessao ativa.
3. Se nao ha usuario autenticado e a rota nao e `/login`, redireciona para `/login`.
4. Se ha usuario autenticado e a rota e `/login`, redireciona para `/`.
5. Caso contrario, deixa a requisicao prosseguir normalmente.

### Matcher (rotas protegidas)

```
/((?!_next/static|_next/image|favicon\.ico|icon-.*\.png|logo\.png|manifest\..*|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)
```

Todas as rotas de pagina sao protegidas exceto assets estaticos.

### O que acontece sem sessao ativa

Qualquer acesso a uma rota protegida sem sessao ativa resulta em redirect imediato para `/login`. A verificacao de permissoes granulares (podeAcessar, podeCriar, etc.) so e aplicada apos a autenticacao.

---

## 6. Tabelas com RLS

As tabelas do modulo organizacional (departamentos, cargos, funcoes, usuarios) e as tabelas de permissoes foram criadas com controle de acesso. As policies especificas de RLS devem ser confirmadas no Supabase Dashboard, pois nao estao documentadas no codigo-fonte da aplicacao.

### Situacao a confirmar no Supabase Dashboard

| Tabela              | Observacao                                                                 |
|---------------------|----------------------------------------------------------------------------|
| departamentos       | Verificar policies de SELECT, INSERT, UPDATE para usuarios autenticados    |
| cargos              | Verificar policies de SELECT, INSERT, UPDATE para usuarios autenticados    |
| funcoes             | Verificar policies de SELECT, INSERT, UPDATE para usuarios autenticados    |
| usuarios            | Verificar policies — acesso ao proprio perfil vs. acesso de administrador  |
| permissoes_funcao   | Verificar se SELECT e permitido para usuarios autenticados (necessario para carregarPermissoes) |
| modulos_sistema     | Verificar se SELECT e publico para usuarios autenticados                   |

---

## 7. Estado Atual por Modulo

Baseado no grep de `podeAcessar`, `podeCriar`, `podeEditar`, `podeExcluir` em `app/**/*.tsx`:

| Modulo          | Rota(s)                                  | podeAcessar | podeCriar | podeEditar | podeExcluir | Observacoes |
|-----------------|------------------------------------------|-------------|-----------|------------|-------------|-------------|
| departamentos   | /departamentos                           | sim         | sim       | sim        | N/A         | Controle via inativacao, nao exclusao |
| cargos          | /cargos                                  | sim         | sim       | sim        | N/A         | Controle via inativacao, nao exclusao |
| funcoes         | /funcoes                                 | sim         | sim       | sim        | N/A         | Controle via inativacao, nao exclusao |
| usuarios        | /usuarios                                | sim         | sim       | sim        | N/A         | Controle via inativacao, nao exclusao |
| colheita        | /colheita, /colheita/[id]                | nao         | nao       | sim        | nao         | Apenas podeEditar controla botao de edicao |
| dashboard       | /dashboard                               | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| vendas          | /vendas, /vendas/[id]                    | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| relatorios      | /relatorios                              | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| estoque         | /estoque, /estoque/insumos, /estoque/movimentar, /estoque/categorias | nao* | — | — | — | Modulo registrado, sem guard implementado |
| areas           | /areas, /areas/safras, /areas/[id]       | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| fazendas        | /fazendas                                | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| setores         | /setores                                 | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| produtos        | /produtos                                | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| tipos_caixa     | /tipos-caixa                             | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |
| classificacoes  | /classificacoes                          | nao         | —         | —          | —           | Sem modulo no nav.ts, sem guard           |
| pdca            | /pdca                                    | nao*        | —         | —          | —           | Modulo registrado como 'operacional' no nav |
| tecnica         | /tecnica/irrigacao, /tecnica/pragas      | nao*        | —         | —          | —           | Modulo registrado, sem guard implementado |

*Modulo registrado no enum MODULOS e/ou no nav.ts mas sem guard aplicado na page.tsx.

---

## 8. Modulos sem Guard (Acesso Livre)

As seguintes rotas aceitam qualquer usuario autenticado sem verificacao de permissoes granulares:

- `/` (pagina inicial — mapa da propriedade)
- `/dashboard`
- `/vendas` e `/vendas/[id]`
- `/relatorios`
- `/estoque` e sub-rotas (`/insumos`, `/movimentar`, `/categorias`)
- `/areas` e sub-rotas (`/safras`, `/[id]`)
- `/fazendas` e `/fazendas/[id]`
- `/setores` e `/setores/[id]`
- `/produtos` e `/produtos/[id]`
- `/tipos-caixa` e `/tipos-caixa/[id]`
- `/classificacoes` e `/classificacoes/[id]`
- `/lotes` e `/lotes/[id]`
- `/pdca`
- `/tecnica/irrigacao` e `/tecnica/pragas`

A protecao dessas rotas e apenas no nivel de autenticacao (proxy.ts): usuario precisa estar logado, mas qualquer usuario logado tem acesso completo.

---

## 9. Padrao de Expansao

Para adicionar guards de permissao a um novo modulo, seguir o padrao canonico:

### Passo 1 — Registrar a chave em lib/permissoes.ts

```ts
// Adicionar ao objeto MODULOS:
export const MODULOS = {
  // ... existentes
  novo_modulo: 'novo_modulo',
} as const
```

### Passo 2 — Associar a rota no nav.ts

```ts
{ href: '/novo-modulo', label: 'Novo Modulo', modulo: 'novo_modulo' }
```

O campo `modulo` na estrutura `NavItem` e opcional; omiti-lo significa que a entrada nao tem controle de visibilidade na sidebar.

### Passo 3 — Destructuring na page.tsx

```ts
export default function NovoModuloPage() {
  const { carregando: authCarregando, podeAcessar, podeCriar, podeEditar } = useAuthContext()

  // Aguarda carregamento da sessao antes de verificar permissoes
  if (authCarregando) return <div>Carregando...</div>

  // Guard de acesso — bloqueia visualizacao da pagina inteira
  if (!podeAcessar(MODULOS.novo_modulo)) return (
    <div>Acesso negado. Voce nao tem permissao para acessar este modulo.</div>
  )

  // ... restante da pagina
}
```

### Passo 4 — Guard de botao Novo (podeCriar)

```tsx
{podeCriar(MODULOS.novo_modulo) && (
  <button onClick={abrirNovo}>
    Novo Registro
  </button>
)}
```

### Passo 5 — Guard de botao Editar (podeEditar)

```tsx
{podeEditar(MODULOS.novo_modulo) && (
  <button onClick={() => abrirEditar(item)}>
    Editar
  </button>
)}
```

### Passo 6 — Guard de botao Excluir (podeExcluir) — quando aplicavel

```tsx
{podeExcluir(MODULOS.novo_modulo) && (
  <button onClick={() => excluir(item.id)}>
    Excluir
  </button>
)}
```

### Passo 7 — Inserir no banco

Inserir uma linha em `modulos_sistema` com a chave correspondente e, para cada funcao que deve ter acesso, inserir uma linha em `permissoes_funcao` com os flags desejados.

---

## 10. Decisoes Registradas

### Por que classificacoes nao tem guard

A rota `/classificacoes` nao possui `modulo` definido no `nav.ts` (entrada sem campo `modulo`) e nao usa nenhuma funcao de verificacao de permissoes na page. Isso indica que foi tratada como cadastro auxiliar simples, sem necessidade de controle granular no momento da implementacao. A chave `classificacoes` existe no enum `MODULOS`, portanto e possivel adicionar guard no futuro sem alteracoes na estrutura base.

### Por que podeExcluir e N/A nos modulos organizacionais

Os modulos `departamentos`, `cargos`, `funcoes` e `usuarios` adotam o padrao de **inativacao logica** em vez de exclusao fisica. Cada um implementa uma funcao de verificacao de integridade referencial antes de permitir a inativacao:

- `podeInativarDepartamento` — verifica se ha cargos ativos vinculados
- `podeInativarCargo` — verifica se ha funcoes ativas vinculadas
- `podeInativarFuncao` — verifica se ha usuarios vinculados (a confirmar no codigo)

Por esse motivo, `podeExcluir` nunca e verificado nessas paginas: nao existe operacao de exclusao exposta na UI, apenas o toggle de `ativo`. A permissao `podeEditar` cobre o botao de edicao modal, que e onde o campo `ativo` tambem pode ser alterado.

---

## 11. Checklist de Teste — Validacao de Permissoes

### Pre-condicoes gerais
- [ ] Quatro funcoes cadastradas no banco com perfis distintos (sem acesso / somente leitura / operador / administrador)
- [ ] Cada funcao com entradas correspondentes em `permissoes_funcao` para os modulos a testar
- [ ] Usuario de teste vinculado a cada funcao via `usuarios.funcao_id`
- [ ] Servidor de desenvolvimento rodando (`npm run dev`)

---

### Perfis de teste

| Perfil | pode_ver | pode_criar | pode_editar |
|---|---|---|---|
| Sem acesso | false | false | false |
| Somente leitura | true | false | false |
| Operador | true | true | false |
| Editor completo | true | true | true |

---

### Bloco A — Validacao de pode_ver (visibilidade no menu e acesso a rota)

Modulos com visibilidade controlada no nav.ts (campo `modulo` presente):

| Modulo | Rota(s) | Menu | Status esperado |
|---|---|---|---|
| dashboard | /dashboard | sim | desaparece quando pode_ver=false |
| vendas | /vendas | sim | desaparece quando pode_ver=false |
| relatorios | /relatorios | sim | desaparece quando pode_ver=false |
| estoque | /estoque, /estoque/insumos, /estoque/movimentar, /estoque/categorias | sim | desaparece quando pode_ver=false |
| areas | /areas, /areas/safras | sim | desaparece quando pode_ver=false |
| fazendas | /fazendas | sim | desaparece quando pode_ver=false |
| setores | /setores | sim | desaparece quando pode_ver=false |
| produtos | /produtos | sim | desaparece quando pode_ver=false |
| tipos_caixa | /tipos-caixa | sim | desaparece quando pode_ver=false |
| operacional | /pdca | sim | desaparece quando pode_ver=false |
| tecnica | /tecnica/irrigacao, /tecnica/pragas | sim | desaparece quando pode_ver=false |
| departamentos | /departamentos | sim | desaparece quando pode_ver=false |
| cargos | /cargos | sim | desaparece quando pode_ver=false |
| funcoes | /funcoes | sim | desaparece quando pode_ver=false |
| usuarios | /usuarios | sim | desaparece quando pode_ver=false |

Casos de teste por modulo com guard podeAcessar implementado:

- [ ] Com pode_ver=true: abrir /departamentos → pagina carrega normalmente
- [ ] Com pode_ver=false: abrir /departamentos → msg "Acesso nao autorizado"
- [ ] Com pode_ver=true: abrir /cargos → pagina carrega normalmente
- [ ] Com pode_ver=false: abrir /cargos → msg "Acesso nao autorizado"
- [ ] Com pode_ver=true: abrir /funcoes → pagina carrega normalmente
- [ ] Com pode_ver=false: abrir /funcoes → msg "Acesso nao autorizado"
- [ ] Com pode_ver=true: abrir /usuarios → pagina carrega normalmente
- [ ] Com pode_ver=false: abrir /usuarios → msg "Acesso nao autorizado"
- [ ] Com pode_ver=true: abrir /colheita → pagina carrega normalmente
- [ ] Com pode_ver=false: abrir /colheita → pagina carrega normalmente (sem guard — acesso livre)
- [ ] Com pode_ver=true: abrir /colheita/[id] → pagina carrega normalmente
- [ ] Com pode_ver=false: abrir /colheita/[id] → pagina carrega normalmente (sem guard — acesso livre)

Modulo sem visibilidade (nao desaparece do menu):

- [ ] /classificacoes: sem modulo no nav.ts, sempre visivel no menu

---

### Bloco B — Validacao de pode_criar (botao "Novo")

Apenas modulos onde podeCriar esta implementado:

| Modulo | Botao | Classe CSS | Acao |
|---|---|---|---|
| departamentos | "+ Novo departamento" | bg-[#0891b2] | abre modal de criacao |
| cargos | "+ Novo cargo" | bg-[#0891b2] | abre modal de criacao |
| funcoes | "+ Nova funcao" | bg-[#0891b2] | abre modal de criacao |
| usuarios | "+ Novo usuario" | bg-[#0891b2] | abre modal de criacao |

Casos de teste:

- [ ] /departamentos com pode_criar=true: botao "+ Novo departamento" visivel e funcional
- [ ] /departamentos com pode_criar=false: botao "+ Novo departamento" oculto
- [ ] /cargos com pode_criar=true: botao "+ Novo cargo" visivel e funcional
- [ ] /cargos com pode_criar=false: botao "+ Novo cargo" oculto
- [ ] /funcoes com pode_criar=true: botao "+ Nova funcao" visivel e funcional
- [ ] /funcoes com pode_criar=false: botao "+ Nova funcao" oculto
- [ ] /usuarios com pode_criar=true: botao "+ Novo usuario" visivel e funcional
- [ ] /usuarios com pode_criar=false: botao "+ Novo usuario" oculto

---

### Bloco C — Validacao de pode_editar (botao "Editar")

Apenas modulos onde podeEditar esta implementado:

| Modulo | Botao | Classe CSS | Acao |
|---|---|---|---|
| departamentos | "Editar" na coluna Acoes | text-[#0891b2] | abre modal para edicao |
| cargos | "Editar" na coluna Acoes | text-[#0891b2] | abre modal para edicao |
| funcoes | "Editar" na coluna Acoes | text-[#0891b2] | abre modal para edicao |
| usuarios | "Editar" na coluna Acoes | text-[#0891b2] | abre modal para edicao |
| colheita | Botoes na tabela | — | controla visibilidade de edicoes |

Casos de teste:

- [ ] /departamentos com pode_editar=true: botao "Editar" visivel em cada linha
- [ ] /departamentos com pode_editar=false: botao "Editar" oculto em todas as linhas
- [ ] /cargos com pode_editar=true: botao "Editar" visivel em cada linha
- [ ] /cargos com pode_editar=false: botao "Editar" oculto em todas as linhas
- [ ] /funcoes com pode_editar=true: botao "Editar" visivel em cada linha
- [ ] /funcoes com pode_editar=false: botao "Editar" oculto em todas as linhas
- [ ] /usuarios com pode_editar=true: botao "Editar" visivel em cada linha
- [ ] /usuarios com pode_editar=false: botao "Editar" oculto em todas as linhas
- [ ] /colheita com pode_editar=true: botoes de edicao visiveis
- [ ] /colheita com pode_editar=false: botoes de edicao ocultos
- [ ] /colheita/[id] com pode_editar=true: formularios habilitados
- [ ] /colheita/[id] com pode_editar=false: formularios desabilitados

---

### Bloco D — Casos de borda

- [ ] Sessao expirada durante uso → proxy.ts redireciona para /login
- [ ] Usuario sem funcao_id → permissoes carregadas como {} → todos os guards retornam false
- [ ] Usuario com funcao_id sem entradas em permissoes_funcao → mesmo resultado (permissoes vazias)
- [ ] Trocar de usuario logado em outra aba → permissoes recarregadas automaticamente
- [ ] Deletar funcao_id de um usuario ativo → permissoes limpas e UI se adapta

---

### Resumo de cobertura atual

| Modulo | podeAcessar | podeCriar | podeEditar | Status |
|---|---|---|---|---|
| departamentos | Sim | Sim | Sim | Completo |
| cargos | Sim | Sim | Sim | Completo |
| funcoes | Sim | Sim | Sim | Completo |
| usuarios | Sim | Sim | Sim | Completo |
| colheita | Nao | Nao | Sim | Parcial (apenas edicao) |
| dashboard | Nao | — | — | Pendente |
| vendas | Nao | — | — | Pendente |
| relatorios | Nao | — | — | Pendente |
| estoque | Nao | — | — | Pendente |
| areas | Nao | — | — | Pendente |
| fazendas | Nao | — | — | Pendente |
| setores | Nao | — | — | Pendente |
| produtos | Nao | — | — | Pendente |
| tipos_caixa | Nao | — | — | Pendente |
| operacional | Nao | — | — | Pendente |
| tecnica | Nao | — | — | Pendente |
| classificacoes | Nao | — | — | Sem modulo (nao controlado) |

Modulos com cobertura completa (3/3 guards): departamentos, cargos, funcoes, usuarios
Modulos pendentes (sem guards): 12
Modulos parcialmente implementados: colheita (apenas podeEditar)

---

## 12. Como o Menu e as Rotas Consomem podeAcessar()

### Menu lateral (Sidebar.tsx)

O componente `Sidebar` filtra a navegacao em cascata usando tres funcoes auxiliares que consultam `podeAcessar()` do contexto:

#### itemPodeVer(item: NavItem): boolean

```tsx
function itemPodeVer(item: NavItem): boolean {
  return !item.modulo || podeAcessar(item.modulo)
}
```

Se um item nao tiver `modulo` definido, ele sempre e visivel (retorna `true`). Se tiver `modulo`, verifica se a funcao do usuario tem permissao `pode_ver` para esse modulo.

#### grupoTemItensVisiveis(grupo: NavGroup): boolean

```tsx
function grupoTemItensVisiveis(grupo: NavGroup): boolean {
  return grupo.items.some((item) => {
    if (isSubGroup(item)) {
      return item.items.some((i) => itemPodeVer(i))
    }
    return itemPodeVer(item as NavItem)
  })
}
```

Itera pelos itens do grupo. Se algum item passa por `itemPodeVer()`, o grupo tem pelo menos um item visivel. Para sub-grupos, verifica se ha itens visiveis dentro deles.

#### secaoTemItensVisiveis(entries: (NavGroup | NavItem)[]): boolean

```tsx
function secaoTemItensVisiveis(entries: (NavGroup | NavItem)[]): boolean {
  return entries.some((entry) => {
    if (isGroup(entry)) return grupoTemItensVisiveis(entry)
    return itemPodeVer(entry as NavItem)
  })
}
```

Percorre as entradas de uma secao. Se for um grupo, consulta `grupoTemItensVisiveis()`. Se for um item direto, consulta `itemPodeVer()`. Se alguma entrada tem itens visiveis, a secao tem conteudo.

#### Comportamento em cascata

O fluxo de filtragem funciona em tres niveis:

```
Secao (sempre renderizada se tiver conteudo visivel)
  |
  +-- Grupo (desaparece se grupoTemItensVisiveis() retornar false)
  |    |
  |    +-- Item (desaparece se itemPodeVer() retornar false)
  |
  +-- Sub-grupo (desaparece se nenhum item dentro tiver itemPodeVer() = true)
       |
       +-- Item (desaparece se itemPodeVer() retornar false)
```

Secoes invisveis:

No topo do render, `secoesVisiveis` filtra o array `NAV_SIDEBAR`:

```tsx
const secoesVisiveis = NAV_SIDEBAR
  .map((section) => ({
    ...section,
    entries: section.entries.filter((entry) => {
      if (isGroup(entry)) return grupoTemItensVisiveis(entry)
      return itemPodeVer(entry as NavItem)
    }),
  }))
  .filter((section) => secaoTemItensVisiveis(section.entries))
```

Se uma secao inteira nao tiver nenhum item visivel (todos os grupos/itens falharem em `itemPodeVer()`), a secao desaparece do menu.

#### Itens com modulo definido vs sem modulo

Extractado de `lib/nav.ts`:

| Secao | Grupo/Item | Label | modulo | Comportamento |
|---|---|---|---|---|
| Gerencial | Controle da Producao | Dashboard | `'dashboard'` | Desaparece se `pode_ver=false` |
| Gerencial | Controle da Producao | Vendas | `'vendas'` | Desaparece se `pode_ver=false` |
| Gerencial | Controle da Producao | Colheita-campo (sub) | (nao tem) | Sempre visivel |
| Gerencial | Controle da Producao | Colheita-registro (sub) | (nao tem) | Sempre visivel |
| Gerencial | Controle da Producao | Relatorios | `'relatorios'` | Desaparece se `pode_ver=false` |
| Gerencial | Estoque | Painel | `'estoque'` | Desaparece se `pode_ver=false` |
| Gerencial | Estoque | Insumos | `'estoque'` | Desaparece se `pode_ver=false` |
| Gerencial | Estoque | Movimentar | `'estoque'` | Desaparece se `pode_ver=false` |
| Gerencial | Estoque | Categorias | `'estoque'` | Desaparece se `pode_ver=false` |
| Gerencial | Gestao de Areas | Painel | `'areas'` | Desaparece se `pode_ver=false` |
| Gerencial | Gestao de Areas | Safras | `'areas'` | Desaparece se `pode_ver=false` |
| Operacional | — | PDCA | `'operacional'` | Desaparece se `pode_ver=false` |
| Area Tecnica | — | Manejo de Irrigacao | `'tecnica'` | Desaparece se `pode_ver=false` |
| Area Tecnica | — | Monitoramento de Pragas | `'tecnica'` | Desaparece se `pode_ver=false` |
| Cadastros | — | Fazendas | `'fazendas'` | Desaparece se `pode_ver=false` |
| Cadastros | — | Setores | `'setores'` | Desaparece se `pode_ver=false` |
| Cadastros | — | Produtos | `'produtos'` | Desaparece se `pode_ver=false` |
| Cadastros | — | Tipos de Caixa | `'tipos_caixa'` | Desaparece se `pode_ver=false` |
| Cadastros | — | Classificacoes | (nao tem) | Sempre visivel |
| Cadastros | Organograma | Departamentos | `'departamentos'` | Desaparece se `pode_ver=false` |
| Cadastros | Organograma | Cargos | `'cargos'` | Desaparece se `pode_ver=false` |
| Cadastros | Organograma | Funcoes | `'funcoes'` | Desaparece se `pode_ver=false` |
| Cadastros | Organograma | Usuarios | `'usuarios'` | Desaparece se `pode_ver=false` |

Observacoes:
- Items do sub-grupo "Colheita" nao tem `modulo`, entao sempre aparecem no menu mesmo que o usuario nao tenha permissao (filtragem granular acontece na page)
- Item "Classificacoes" nao tem `modulo`, entao sempre aparece no menu
- Todos os itens com `modulo` sao filtrados por `itemPodeVer()`
- Quando todos os itens de um grupo ficam invisveis, o grupo desaparece da sidebar
- Quando todos os grupos de uma secao ficam invisveis, a secao desaparece da sidebar

---

### Protecao de rota (proxy.ts)

O `proxy` (equivalente ao middleware do Next.js 16) e executado **antes** de qualquer page carregar. Ele cria um cliente Supabase server-side e verifica a sessao:

```tsx
const { data: { user } } = await supabase.auth.getUser()

const isLoginPage = request.nextUrl.pathname.startsWith('/login')

if (!user && !isLoginPage) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

if (user && isLoginPage) {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.redirect(url)
}

return supabaseResponse
```

Logica:
1. Se nao ha usuario autenticado E a rota nao e `/login` → redireciona para `/login`
2. Se ha usuario autenticado E a rota e `/login` → redireciona para `/`
3. Caso contrario, deixa a requisicao prosseguir

#### Matcher (rotas protegidas)

```
/((?!_next/static|_next/image|favicon\.ico|icon-.*\.png|logo\.png|manifest\..*|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)
```

Este regex protege **todas as rotas de pagina** exceto:
- Assets estaticos (_next/static, _next/image)
- Favicon, icons, manifests
- Arquivos de imagem (svg, png, jpg, jpeg, gif, webp)

Qualquer tentativa de acesso a uma rota protegida sem sessao ativa resulta em redirect imediato para `/login`.

#### Diferenca entre proxy e guard de page

| Camada | Onde roda | O que verifica | O que faz se falhar | Ordem de execucao |
|---|---|---|---|---|
| `proxy.ts` | Server (middleware) | Sessao ativa (`auth.users`) | Redireciona para `/login` | **1a — antes da page** |
| `podeAcessar()` na page | Client (dentro da page) | Permissao granular do modulo (`permissoes_funcao`) | Renderiza bloco "Acesso nao autorizado" | 2a — dentro da page |

**Exemplo:**

Usuario sem sessao tenta acessar `/vendas`:
1. `proxy.ts` intercepta a requisicao
2. `supabase.auth.getUser()` retorna `null`
3. Redirect imediato para `/login` (a page `/vendas` nunca e renderizada)

Usuario com sessao, mas sem permissao para vendas, tenta acessar `/vendas`:
1. `proxy.ts` deixa a requisicao prosseguir (sessao ativa)
2. Page `/vendas` carrega no cliente
3. `useAuthContext()` carrega `permissoes` do banco
4. Guard verifica `if (!podeAcessar(MODULOS.vendas))`
5. Se `pode_ver=false`, renderiza "Acesso negado"

---

### Fluxo completo de uma requisicao autenticada

Diagrama do caminho completo quando um usuario acessa uma rota protegida:

```
Usuário acessa uma URL (ex: /vendas)
  |
  v
proxy.ts recebe a requisicao (middleware, server-side)
  |
  +-- supabase.auth.getUser() verifica sessao em cookies
  |
  +-- Se sem usuario: redirect /login (fim aqui, page nao carrega)
  |
  +-- Se com usuario: prossegue normalmente
  |
  v
app/layout.tsx renderiza
  |
  +-- AuthProvider envolve toda a arvore
  |
  v
app/vendas/page.tsx carrega
  |
  +-- useAuthContext() hook executa
  |    |
  |    +-- Chama carregarPermissoes(funcao_id do usuario)
  |    |
  |    +-- Query em permissoes_funcao JOIN modulos_sistema
  |    |
  |    +-- Retorna objeto Permissoes (ex: { vendas: { pode_ver: true, ... }, ... })
  |    |
  |    +-- Disponibiliza podeAcessar() no contexto
  |
  v
Sidebar.tsx renderiza
  |
  +-- Filtra NAV_SIDEBAR usando itemPodeVer(), grupoTemItensVisiveis()
  |
  +-- Itens com modulo='vendas' aparecem apenas se podeAcessar('vendas')=true
  |
  v
Condicional na page: if (!podeAcessar(MODULOS.vendas))
  |
  +-- Se true: renderiza "Acesso nao autorizado"
  |
  +-- Se false: renderiza page completa
  |
  v
Usuario vê a página ou mensagem de acesso negado
```

Resumo das camadas:
1. **Sessao (proxy)** — primeira defesa, autentica o usuario
2. **Permissao (context + hooks)** — carrega permissoes do banco em tempo de render
3. **UI (page)** — guards condicionais e filtragem de componentes
4. **Menu (sidebar)** — oculta opcoes que nao sao acessiveis
