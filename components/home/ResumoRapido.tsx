'use client'

type Props = {
  totalFazendas: number
  totalAreas: number
  totalSetores: number
  safraNome: string | null
  carregando: boolean
}

export function ResumoRapido({ totalFazendas, totalAreas, totalSetores, safraNome, carregando }: Props) {
  const itens = [
    { label: 'Fazendas', valor: totalFazendas, icone: '🏡' },
    { label: 'Áreas',    valor: totalAreas,    icone: '🗺️' },
    { label: 'Setores',  valor: totalSetores,  icone: '📐' },
    { label: 'Safra Ativa', valor: safraNome ?? '—', icone: '🌱' },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {itens.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm"
        >
          <span className="text-lg">{item.icone}</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className="text-lg font-black text-[#0891b2]">
              {carregando ? '…' : item.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
