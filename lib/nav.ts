type NavItem = { href: string; label: string }
type NavGroup = { group: string; items: NavItem[] }

export type NavEntry = NavItem | NavGroup

export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'group' in entry
}

export const NAV_SIDEBAR: NavEntry[] = [
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/lotes',      label: 'Colheita-campo' },
  { href: '/colheita',   label: 'Colheita-registro' },
  { href: '/vendas',     label: 'Vendas' },
  { href: '/relatorios', label: 'Relatórios' },
  {
    group: 'Cadastros',
    items: [
      { href: '/fazendas',       label: 'Fazendas' },
      { href: '/setores',        label: 'Setores' },
      { href: '/produtos',       label: 'Produtos' },
      { href: '/tipos-caixa',    label: 'Tipos de Caixa' },
      { href: '/classificacoes', label: 'Classificações' },
    ],
  },
]
