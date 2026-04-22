---
name: org-core
description: Estrutura do módulo organizacional
model: claude-haiku-4-5-20251001
tools: []
triggers: [usuarios, departamentos, cargos, funcoes, organograma]
---

# Escopo

app/usuarios/page.tsx
app/departamentos/page.tsx
app/cargos/page.tsx
app/funcoes/page.tsx

# Banco

usuarios
departamentos
cargos
funcoes

# Hierarquia

departamentos → cargos → funcoes → usuarios

# Regras

- Não inativar com dependência
- Usuário depende de função, cargo e departamento

# NÃO TOCAR

auth
estoque
vendas
layout