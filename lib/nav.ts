// ── Tipos de navegação ──────────────────────────────────────────────────────
// Hierarquia: NavSection > NavGroup > NavGroupItem (NavItem | NavSubGroup > NavItem)

export type NavItem = { href: string; label: string; modulo?: string }

// Sub-grupo dentro de um grupo (ex: "Colheita" com 2 itens)
export type NavSubGroup = { subgroup: string; items: NavItem[] }

// Entrada dentro de um grupo: link simples ou sub-grupo com label
export type NavGroupItem = NavItem | NavSubGroup

// Grupo expansível dentro de uma seção (accordion)
export type NavGroup = { group: string; items: NavGroupItem[] }

// Seção principal (sempre visível como label)
// Pode conter grupos expandíveis e/ou links diretos
export type NavSection = { section: string; entries: (NavGroup | NavItem)[] }

export function isGroup(e: NavGroup | NavItem): e is NavGroup {
  return 'group' in e
}

export function isSubGroup(e: NavGroupItem): e is NavSubGroup {
  return 'subgroup' in e
}

// ── Estrutura do menu ────────────────────────────────────────────────────────

export const NAV_SIDEBAR: NavSection[] = [
  {
    section: 'Gerencial',
    entries: [
      {
        group: 'Controle da Produção',
        items: [
          { href: '/dashboard', label: 'Dashboard', modulo: 'dashboard' },
          { href: '/vendas', label: 'Vendas', modulo: 'vendas' },
          {
            subgroup: 'Colheita',
            items: [
              { href: '/lotes', label: 'Colheita-campo' },
              { href: '/colheita', label: 'Colheita-registro' },
            ],
          },
          { href: '/relatorios', label: 'Relatórios', modulo: 'relatorios' },
        ],
      },
      {
        group: 'Estoque',
        items: [
          { href: '/estoque', label: 'Painel', modulo: 'estoque' },
          { href: '/estoque/insumos', label: 'Insumos', modulo: 'estoque' },
          { href: '/estoque/movimentar', label: 'Movimentar', modulo: 'estoque' },
          { href: '/estoque/categorias', label: 'Categorias', modulo: 'estoque' },
        ],
      },
      {
        group: 'Gestão de Áreas',
        items: [
          { href: '/areas', label: 'Painel', modulo: 'areas' },
          { href: '/areas/safras', label: 'Safras', modulo: 'areas' },
        ],
      },
    ],
  },
  {
    section: 'Operacional',
    entries: [
      { href: '/pdca', label: 'PDCA', modulo: 'operacional' },
    ],
  },
  {
    section: 'Área Técnica',
    entries: [
      { href: '/tecnica/irrigacao', label: 'Manejo de Irrigação', modulo: 'tecnica' },
      { href: '/tecnica/pragas', label: 'Monitoramento de Pragas', modulo: 'tecnica' },
    ],
  },
  {
    section: 'Cadastros',
    entries: [
      { href: '/fazendas', label: 'Fazendas', modulo: 'fazendas' },
      { href: '/setores', label: 'Setores', modulo: 'setores' },
      { href: '/produtos', label: 'Produtos', modulo: 'produtos' },
      { href: '/tipos-caixa', label: 'Tipos de Caixa', modulo: 'tipos_caixa' },
      { href: '/classificacoes', label: 'Classificações', modulo: 'classificacoes' },
      {
        group: 'Organograma',
        items: [
          { href: '/departamentos', label: 'Departamentos', modulo: 'departamentos' },
          { href: '/cargos', label: 'Cargos', modulo: 'cargos' },
          { href: '/funcoes', label: 'Funções', modulo: 'funcoes' },
          { href: '/usuarios', label: 'Usuários', modulo: 'usuarios' },
        ],
      },
    ],
  },
]