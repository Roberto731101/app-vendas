# Padrões do Projeto

## Código
- Usar TypeScript em tudo que for possível.
- Evitar funções muito grandes.
- Separar regra de negócio de interface.
- Reutilizar componentes.

## Nomes
- Pastas e arquivos em padrão consistente.
- Variáveis com nomes claros.
- Evitar abreviações confusas.

## Componentes
- Componentes pequenos e reutilizáveis.
- Separar componentes de layout e de negócio.

## Banco
- Não misturar regra de cálculo com acesso direto ao banco.
- Manter nomes de tabelas e campos consistentes.

## Documentação
- Toda mudança importante deve refletir em docs.
- Regras de negócio devem ser atualizadas sempre que houver mudança.

## Tema Visual (atualizado em 2026-04-20)

### Paleta de cores
- Sidebar fundo:         #1a2e2e  (verde escuro)
- Sidebar texto:         #4dd0e1  (ciano claro)
- Sidebar texto ativo:   #ffffff
- Sidebar item ativo bg: white/10
- Cor primária:          #0891b2  (ciano azulado)
- Cor primária hover:    #0e7490
- Cor primária dark:     #164e63
- Header fundo:          #ffffff  com borda #e2e8f0
- Fundo geral:           #f0f4f4  (off-white esverdeado)
- Botão primário:        bg-[#0891b2] hover:bg-[#0e7490]
- Badges ativos:         bg-cyan-100 text-cyan-700
- Cor de ênfase:         #4dd0e1

### Regras de aplicação
- Todos os textos de destaque usam text-[#0891b2]
- Botões primários: bg-[#0891b2] hover:bg-[#0e7490]
- Links ativos: border-[#0891b2]
- Cards: rounded-2xl shadow-sm bg-white
- Inputs focus: ring-[#0891b2]
- Gradientes em botões principais: from-[#0891b2] to-[#0e7490]