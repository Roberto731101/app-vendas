# Estrutura do Banco

## Tabela: vendas
Campos sugeridos:
- id
- ordem_venda
- data_venda
- cliente_id
- observacao
- created_at

## Tabela: vendas_itens
Campos sugeridos:
- id
- venda_id
- produto_id
- tipo_caixa_id
- classificacao
- qtd_caixas
- kg_por_caixa
- valor_kg
- peso_total
- valor_total
- created_at

## Tabela: clientes
Campos sugeridos:
- id
- nome
- documento
- cidade
- created_at

## Tabela: produtos
Campos sugeridos:
- id
- nome
- ativo

## Tabela: tipos_caixa
Campos sugeridos:
- id
- descricao
- ativo