export function calcularPesoTotal(qtdCaixas: number, kgPorCaixa: number) {
  return qtdCaixas * kgPorCaixa
}

export function calcularValorTotal(pesoTotal: number, valorKg: number) {
  return pesoTotal * valorKg
}