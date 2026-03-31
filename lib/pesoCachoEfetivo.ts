/**
 * Regra de prioridade para peso de cacho efetivo.
 *
 * Prioridade:
 *  1. amostraInformada  — valor registrado diretamente na colheita (amostra_peso_cacho)
 *  2. mediaAmostraVenda — média apurada via venda vinculada ao lote (futuro)
 *  3. SEM_BASE          — nenhuma das fontes disponível
 *
 * Esta função é pura: não acessa banco, não tem efeitos colaterais.
 * Pode ser usada em qualquer hook ou cálculo de produção.
 */

export type OrigemPesoCacho = 'COLHEITA' | 'VENDA' | 'SEM_BASE'

export type ResultadoPesoCachoEfetivo = {
  /** Amostra registrada nas colheitas do lote (pode ser média de várias linhas). */
  amostraInformada: number | null
  /** Peso médio obtido via venda vinculada ao lote. Null até a integração ser implementada. */
  mediaAmostraVenda: number | null
  /** Valor que entra nos cálculos de produção, seguindo a ordem de prioridade. */
  pesoCachoEfetivo: number | null
  /** Indica de onde veio o valor efetivo. */
  origemPesoCacho: OrigemPesoCacho
}

export function calcularPesoCachoEfetivo(
  amostraInformada: number | null,
  mediaAmostraVenda: number | null = null,
): ResultadoPesoCachoEfetivo {
  if (amostraInformada !== null) {
    return {
      amostraInformada,
      mediaAmostraVenda,
      pesoCachoEfetivo: amostraInformada,
      origemPesoCacho: 'COLHEITA',
    }
  }

  if (mediaAmostraVenda !== null) {
    return {
      amostraInformada: null,
      mediaAmostraVenda,
      pesoCachoEfetivo: mediaAmostraVenda,
      origemPesoCacho: 'VENDA',
    }
  }

  return {
    amostraInformada: null,
    mediaAmostraVenda: null,
    pesoCachoEfetivo: null,
    origemPesoCacho: 'SEM_BASE',
  }
}
