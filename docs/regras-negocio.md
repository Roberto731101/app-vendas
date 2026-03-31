# Regras de Negócio

## Vendas
- Toda venda deve possuir cabeçalho.
- Toda venda deve ter pelo menos um item.
- Cliente é obrigatório.
- Data da venda é obrigatória.

## Itens da venda
- Produto é obrigatório.
- Tipo de caixa é obrigatório.
- Quantidade de caixas deve ser maior que zero.
- Kg por caixa deve ser maior que zero.
- Valor por kg deve ser maior ou igual a zero.

## Cálculos
- PesoTotal = QtdCaixas * KgPorCaixa
- ValorTotal = PesoTotal * ValorKg

## Organização
- A venda deve permitir futura consolidação por cliente, produto, período e classificação.