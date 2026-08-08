# Plano de Melhorias — Rastreador ABC & Simulador AF

## Objetivo
Transformar o app de uma ferramenta 100% local em uma aplicação com login na nuvem, dados sincronizados entre dispositivos e uma experiência mobile ainda mais rápida para registro durante sessões de ABA.

## Escopo aprovado
- Foco principal: **Mobile/UX da aba Sessão**.
- Persistência: **nuvem com login**.
- PDF: **comparativo baseline vs intervenção**.
- Timer: **sim, na aba Sessão**.
- Autenticação: perfil do terapeuta + papéis/roles.

## 1. Ativar Lovable Cloud e autenticação

1.1. Habilitar Lovable Cloud (Supabase gerenciado) no projeto.
1.2. Configurar login com **email/senha** e **Google**.
1.3. Criar tabela `public.profiles` ligada a `auth.users` (nome, registro profissional, email, avatar) com trigger de criação automática no signup.
1.4. Criar enum `app_role` e tabela `public.user_roles` (admin, terapeuta, supervisor).
1.5. Criar função `has_role` como `security definer` para uso em RLS.
1.6. Ajustar `src/start.ts` para anexar bearer token em chamadas server function.
1.7. Criar rotas de auth: `/auth` (login/cadastro) e `/reset-password`.
1.8. Criar layout `src/routes/_authenticated/route.tsx` para proteger o app; mover a home logada para `/dashboard` ou manter `/` como landing com redirecionamento.

## 2. Modelar dados na nuvem

Criar migration com as tabelas abaixo, sempre com `GRANT`, `ENABLE ROW LEVEL SECURITY` e políticas apropriadas:

```text
auth.users (já existente)
  └── public.profiles (id FK auth.users, name, license, email, avatar_url)
  └── public.user_roles (id, user_id FK, role)

public.children
  - id, owner_id FK auth.users, name, birth_date, target_behavior, notes, created_at
  - RLS: owner lê/escreve; admin lê/escreve tudo

public.abc_logs
  - id, owner_id, child_id, timestamp, phase (baseline|intervention)
  - antecedent, antecedent_tags, behavior, severity
  - consequence, consequence_tags, hypothesized_function
  - environment_tags, environment_notes
  - RLS: owner lê/escreve; admin lê/escreve tudo

public.fa_sessions
  - id, owner_id, child_id, condition, duration_min, frequency, created_at
  - RLS: owner lê/escreve; admin lê/escreve tudo
```

## 3. Sincronizar aplicação

3.1. Criar server functions para CRUD de `children`, `abc_logs` e `fa_sessions` usando `requireSupabaseAuth`.
3.2. Substituir hooks `useLogs`, `useFASessions` e `useChildren` para consultar a nuvem via `useQuery`/`useMutation` do TanStack Query.
3.3. Manter cache local com TanStack Query para uso offline breve; salvar alterações pendentes quando a rede voltar (opcional, fase 2).
3.4. Atualizar `Dashboard`, `Logger`, `QuickLogger` e `Simulator` para usar IDs de criança vindos da tabela `children`.
3.5. Adicionar seletor de criança em todos os pontos de entrada.

## 4. Melhorar UX mobile da aba Sessão

4.1. Integrar **timer de 50 minutos** no topo da aba Sessão com:
- botões Iniciar/Pausar/Reiniciar;
- barra circular/de progresso visível;
- alerta sonoro + vibração ao final (quando suportado).
4.2. Aumentar área de toque dos cards A, B e C:
- manter grid 2 ou 3 colunas com cards quadrados grandes;
- destaque visual imediato ao selecionar;
- avanço automático A → B → C após toque.
4.3. Reduzir confirmação de salvamento para **um toque final** no botão verde fixo na base.
4.4. Adicionar modo "mão única": botão de registrar ocorrência fixo e acessível no polegar.
4.5. Mostrar contador de ocorrências da sessão atual e tempo decorrido.

## 5. Relatório PDF comparativo

5.1. Atualizar `src/lib/aba-pdf.ts` para incluir seção **Baseline vs Intervenção**:
- tabela com taxa de respostas por função em cada fase;
- redução percentual entre fases;
- destaque para função mais frequente em cada fase.
5.2. Manter exportação automática ao finalizar sessão no Simulador AF.
5.3. Adicionar botão de exportação manual na aba Painel.

## 6. Painel e Insights

6.1. Filtros por criança e por fase (baseline/intervenção/ambas).
6.2. Insights clínicos já existentes continuam, agora calculados a partir dos dados do banco.
6.3. Gráfico de dispersão e gráfico de condições AF respeitam o filtro ativo.

## 7. Segurança e governança

7.1. Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no cliente.
7.2. Usar `requireSupabaseAuth` em todas as server functions que manipulam dados do usuário.
7.3. Validar inputs com Zod nas server functions.
7.4. Garantir que papéis fiquem na tabela `user_roles`, não no `profiles`.

## Critérios de aceitação
- Usuário consegue criar conta, fazer login e ver dados sincronizados após recarregar.
- Terapeuta registra uma ocorrência na aba Sessão em no máximo 3 toques.
- Timer de 50 min alerta ao final.
- PDF gerado mostra comparativo baseline/intervenção.
- Apenas o próprio usuário (e admins) acessam seus registros.

## Notas técnicas
- Framework: TanStack Start + React 19.
- Banco/Auth: Lovable Cloud (Supabase).
- Estilo: Tailwind CSS v4 com tokens do tema existente.
- PDF: jsPDF + jspdf-autotable (já instalados).
- Ícones: Lucide React (já instalado).
