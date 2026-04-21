// ── Tipos de navegação ──────────────────────────────────────────────────────
// Hierarquia: NavSection > NavGroup > NavGroupItem (NavItem | NavSubGroup > NavItem)

export type NavItem = { href: string; label: string }

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
          { href: '/dashboard',  label: 'Dashboard' },
          { href: '/vendas',     label: 'Vendas' },
          {
            subgroup: 'Colheita',
            items: [
              { href: '/lotes',    label: 'Colheita-campo' },
              { href: '/colheita', label: 'Colheita-registro' },
            ],
          },
          { href: '/relatorios', label: 'Relatórios' },
        ],
      },
      {
        group: 'Estoque',
        items: [
          { href: '/estoque',             label: 'Painel' },
          { href: '/estoque/insumos',     label: 'Insumos' },
          { href: '/estoque/movimentar',  label: 'Movimentar' },
          { href: '/estoque/categorias',  label: 'Categorias' },
        ],
      },
      {
        group: 'Gestão de Áreas',
        items: [
          { href: '/areas',         label: 'Painel' },
          { href: '/areas/safras',  label: 'Safras' },
        ],
      },
    ],
  },
  {
    section: 'Operacional',
    entries: [
      { href: '/pdca', label: 'PDCA' },
    ],
  },
  {
    section: 'Área Técnica',
    entries: [
      { href: '/tecnica/irrigacao', label: 'Manejo de Irrigação' },
      { href: '/tecnica/pragas',    label: 'Monitoramento de Pragas' },
    ],
  },
  {
    section: 'Cadastros',
    entries: [
      { href: '/fazendas',       label: 'Fazendas' },
      { href: '/setores',        label: 'Setores' },
      { href: '/produtos',       label: 'Produtos' },
      { href: '/tipos-caixa',    label: 'Tipos de Caixa' },
      { href: '/classificacoes', label: 'Classificações' },
      {
        group: 'Organograma',
        items: [
          { href: '/departamentos', label: 'Departamentos' },
          { href: '/cargos',        label: 'Cargos' },
          { href: '/funcoes',       label: 'Funções' },
          { href: '/usuarios',      label: 'Usuários' },
        ],
      },
    ],
  },
]
