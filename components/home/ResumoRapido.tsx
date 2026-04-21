'use client'

type Props = {
  totalFazendas: number
  totalAreas: number
  totalSetores?: number
  safraNome: string | null
  carregando: boolean
}

export function ResumoRapido({ totalFazendas, totalAreas, totalSetores = 0, safraNome, carregando }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <span className="text-lg">🏡</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fazendas</p>
          <p className="text-lg font-black text-[#0891b2]">{carregando ? '…' : totalFazendas}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <span className="text-lg">🗺️</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Áreas</p>
          <p className="text-lg font-black text-[#0891b2]">{carregando ? '…' : totalAreas}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <span className="text-lg">📐</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Setores</p>
          <p className="text-lg font-black text-[#0891b2]">{carregando ? '…' : totalSetores}</p>
        </div>
      </div>

      {/* Safra Ativa: ocupa toda a linha no mobile, 1 coluna no desktop */}
      <div className="col-span-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm lg:col-span-1">
        <span className="text-lg">🌱</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Safra Ativa</p>
          <p className="text-lg font-black text-[#0891b2]">{carregando ? '…' : safraNome ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
