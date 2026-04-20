const CORES: Record<string, string> = {
  fertilizante: 'bg-green-100 text-green-700',
  defensivo:    'bg-orange-100 text-orange-700',
  semente:      'bg-blue-100 text-blue-700',
}

function corPorTipo(tipo: string | null): string {
  if (!tipo) return 'bg-slate-100 text-slate-600'
  return CORES[tipo.toLowerCase()] ?? 'bg-slate-100 text-slate-600'
}

type Props = {
  nome: string
  tipo?: string | null
  className?: string
}

export function CategoriaPill({ nome, tipo, className = '' }: Props) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${corPorTipo(tipo)} ${className}`}>
      {nome}
    </span>
  )
}

export { corPorTipo }
