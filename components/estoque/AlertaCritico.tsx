import Link from 'next/link'
import type { Insumo } from '@/hooks/useInsumos'

type Props = {
  criticos: Insumo[]
}

export function AlertaCritico({ criticos }: Props) {
  if (criticos.length === 0) return null

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-4">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="font-bold text-red-700">
            {criticos.length === 1
              ? `${criticos[0].nome_insumo} está em nível crítico`
              : `${criticos.length} insumos estão em nível crítico`}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {criticos.slice(0, 5).map((i) => (
              <span key={i.id} className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {i.nome_insumo} — {i.quantidade_atual} {i.unidade}
              </span>
            ))}
            {criticos.length > 5 && (
              <span className="rounded-lg bg-red-100 px-3 py-1 text-xs text-red-600">
                +{criticos.length - 5} mais
              </span>
            )}
          </div>
        </div>
        <Link
          href="/estoque/movimentar"
          className="shrink-0 rounded-xl bg-[#1a3a2a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2419]"
        >
          Solicitar Entrada
        </Link>
      </div>
    </div>
  )
}
