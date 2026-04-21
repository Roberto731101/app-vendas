import type { FazendaComHierarquia, AreaHierarquia, SetorHierarquia } from '@/hooks/useFazendas'

type SetorNodeProps = {
  setor: SetorHierarquia
  onEditarSetor: (setor: SetorHierarquia) => void
  onExcluirSetor: (id: number) => void
}

function SetorNode({ setor, onEditarSetor, onExcluirSetor }: SetorNodeProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-2.5 border border-green-100">
      <div className="flex items-center gap-2">
        <span className="text-green-600">🟩</span>
        <span className="text-sm font-semibold text-slate-800">{setor.nome}</span>
        <span className="text-xs text-slate-500">— Nº {setor.numero}</span>
        {setor.hect != null && (
          <span className="text-xs text-slate-500">— {setor.hect.toLocaleString('pt-BR')} ha</span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEditarSetor(setor)}
          className="rounded-lg bg-[#0891b2]/10 px-2.5 py-1 text-xs font-bold text-[#0891b2] hover:bg-[#0891b2]/20"
        >
          Editar
        </button>
        <button
          onClick={() => onExcluirSetor(setor.id)}
          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
        >
          Excluir
        </button>
      </div>
    </div>
  )
}

type AreaNodeProps = {
  area: AreaHierarquia
  onEditarArea: (area: AreaHierarquia) => void
  onExcluirArea: (id: number) => void
  onEditarSetor: (setor: SetorHierarquia) => void
  onExcluirSetor: (id: number) => void
  onNovoSetor: (areaId: number) => void
}

function AreaNode({ area, onEditarArea, onExcluirArea, onEditarSetor, onExcluirSetor, onNovoSetor }: AreaNodeProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5 border border-blue-100">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">🟦</span>
          <span className="text-sm font-semibold text-slate-800">{area.nome}</span>
          {area.numero && (
            <span className="text-xs text-slate-500">({area.numero})</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNovoSetor(area.id)}
            className="rounded-lg bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-green-200"
          >
            + Setor
          </button>
          <button
            onClick={() => onEditarArea(area)}
            className="rounded-lg bg-[#0891b2]/10 px-2.5 py-1 text-xs font-bold text-[#0891b2] hover:bg-[#0891b2]/20"
          >
            Editar
          </button>
          <button
            onClick={() => onExcluirArea(area.id)}
            className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
          >
            Excluir
          </button>
        </div>
      </div>

      {area.setores && area.setores.length > 0 && (
        <div className="ml-6 space-y-2">
          {area.setores.map((setor) => (
            <SetorNode
              key={setor.id}
              setor={setor}
              onEditarSetor={onEditarSetor}
              onExcluirSetor={onExcluirSetor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type Props = {
  fazendas: FazendaComHierarquia[]
  onEditarFazenda: (fazenda: FazendaComHierarquia) => void
  onExcluirFazenda: (id: number) => void
  onNovaArea: (fazendaId: number) => void
  onEditarArea: (area: AreaHierarquia) => void
  onExcluirArea: (id: number) => void
  onNovoSetor: (areaId: number) => void
  onEditarSetor: (setor: SetorHierarquia) => void
  onExcluirSetor: (id: number) => void
}

export function HierarquiaView({
  fazendas,
  onEditarFazenda,
  onExcluirFazenda,
  onNovaArea,
  onEditarArea,
  onExcluirArea,
  onNovoSetor,
  onEditarSetor,
  onExcluirSetor,
}: Props) {
  if (fazendas.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm text-center text-sm text-slate-500">
        Nenhuma fazenda cadastrada.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fazendas.map((fazenda) => (
        <div key={fazenda.id} className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="font-bold text-slate-900 uppercase tracking-wide">{fazenda.nome}</span>
              {fazenda.descricao && (
                <span className="text-xs text-slate-500">— {fazenda.descricao}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNovaArea(fazenda.id)}
                className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200"
              >
                + Área
              </button>
              <button
                onClick={() => onEditarFazenda(fazenda)}
                className="rounded-lg bg-[#0891b2]/10 px-2.5 py-1 text-xs font-bold text-[#0891b2] hover:bg-[#0891b2]/20"
              >
                Editar
              </button>
              <button
                onClick={() => onExcluirFazenda(fazenda.id)}
                className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
              >
                Excluir
              </button>
            </div>
          </div>

          {fazenda.areas && fazenda.areas.length > 0 ? (
            <div className="ml-4 space-y-2 border-l-2 border-slate-100 pl-4">
              {fazenda.areas.map((area) => (
                <AreaNode
                  key={area.id}
                  area={area}
                  onEditarArea={onEditarArea}
                  onExcluirArea={onExcluirArea}
                  onEditarSetor={onEditarSetor}
                  onExcluirSetor={onExcluirSetor}
                  onNovoSetor={onNovoSetor}
                />
              ))}
            </div>
          ) : (
            <p className="ml-4 text-xs text-slate-400">Nenhuma área cadastrada nesta fazenda.</p>
          )}
        </div>
      ))}
    </div>
  )
}
