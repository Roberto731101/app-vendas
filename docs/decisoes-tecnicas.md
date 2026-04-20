# Decisões Técnicas

## Stack adotada
- Next.js para frontend e rotas
- Supabase para banco
- TypeScript para segurança e manutenção
- Supabase Auth para autenticação (adotado em 2026-04-20)
- @supabase/ssr para sessão baseada em cookies (necessário para proxy/middleware)

## Autenticação
- Sessão persistida via cookies (createBrowserClient do @supabase/ssr)
- Proteção de rotas via proxy.ts (Next.js 16 — equivalente ao middleware)
- Perfil do usuário: tabela `usuarios` vinculada ao Auth via `auth_id`
- Hook useAuth.ts + AuthContext.tsx para estado global de sessão
- Login: /login — redireciona para / após autenticação bem-sucedida
- Logout: disponível no header (AppHeader) e no rodapé da Sidebar

## Motivos
- Facilidade de evolução
- Boa integração com dados
- Estrutura adequada para relatórios futuros

## Diretrizes
- Evitar acoplamento excessivo
- Separar UI, regra de negócio e acesso a dados