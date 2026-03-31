type NavItem = {
  label: string
  active?: boolean
}

type Props = {
  navItems: NavItem[]
  onMenuToggle: () => void
}

export function AppHeader({ navItems, onMenuToggle }: Props) {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-10">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#063f81] hover:bg-slate-100 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Nolasco Produção"
            className="h-8 w-auto lg:h-10"
          />
          <h2 className="text-base font-bold uppercase tracking-tight text-[#063f81] lg:text-lg">
            NOLASCO PRODUÇÃO
          </h2>
        </div>
      </div>

      <div className="hidden gap-6 text-sm md:flex">
        {navItems.map((item) => (
          <a
            key={item.label}
            className={
              item.active
                ? 'border-b-2 border-[#063f81] pb-1 text-[#063f81]'
                : 'text-slate-500'
            }
          >
            {item.label}
          </a>
        ))}
      </div>
    </header>
  )
}
