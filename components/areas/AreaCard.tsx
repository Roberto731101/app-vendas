import Link from 'next/link'
import type { AreaGeo, StatusSaude } from '@/hooks/useGestaoAreas'

const STATUS_LABEL: Record<StatusSaude, string>  = { excelente: 'Excelente', estavel: 'Estável', critico: 'Crítico' }
const STATUS_BADGE: Record<StatusSaude, string>  = {
  excelente: 'bg-green-100 text-green-700',
  estavel:   'bg-amber-100 text-amber-700',
  critico:   'bg-red-100 text-red-700',
}
const STATUS_DOT: Record<StatusSaude, string> = {
  excelente: 'bg-green-500',
  estavel:   'bg-amber-500',
  critico:   'bg-red-500',
}

type Props = { area: AreaGeo }

export function AreaCard({ area }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900">{area.nome}</p>
          <p className="text-xs text-slate-400">{area.fazenda_nome} · Nº {area.numero}</p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[area.status_saude]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[area.status_saude]}`} />
          {STATUS_LABEL[area.status_saude]}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Área</p>
          <p className="text-lg font-black text-slate-800">{area.hect ?? '—'}</p>
          <p className="text-[10px] text-slate-400">hectares</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alertas</p>
          <p className={`text-lg font-black ${area.alertas > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {area.alertas}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Críticos</p>
          <p className={`text-lg font-black ${area.criticos > 0 ? 'text-red-600' : 'text-slate-400'}`}>
            {area.criticos}
          </p>
        </div>
      </div>

      <Link
        href={`/areas/${area.id}`}
        className="block w-full rounded-xl bg-slate-100 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-200"
      >
        Ver Detalhes →
      </Link>
    </div>
  )
}
