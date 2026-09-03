# Página de Administração

Uma área `/admin` para visualizar e gerenciar todos os terapeutas e todos os pacientes do sistema, acessível apenas a quem tem papel de administrador.

## O que "sem depender de RLS" significa aqui

Hoje cada terapeuta só enxerga os próprios dados porque o banco filtra por usuário (RLS). O admin precisa ver tudo, então as consultas do painel passam por funções de servidor com privilégio elevado. Essas funções **verificam no servidor se quem chamou é admin antes de qualquer leitura**. O RLS continua ativo para o app dos terapeutas — nada é afrouxado; o admin apenas usa um caminho separado e verificado.

## Login

Mesma tela de login já existente. Seu usuário recebe o papel `admin` (a tabela de papéis já existe no projeto). Quem não é admin nem vê o link nem consegue abrir `/admin` — a verificação acontece no servidor, não só na tela.

## O que a página terá

**Aba Terapeutas**
- Lista com nome, CRP/licença, e-mail, data de cadastro, nº de pacientes e nº de registros
- Busca por nome/e-mail
- Abrir um terapeuta mostra os pacientes dele
- Conceder/remover papel de admin de outro usuário

**Aba Pacientes**
- Lista global: nome do paciente, terapeuta responsável, comportamento alvo, nº de registros ABC, nº de sessões
- Busca e filtro por terapeuta
- Editar nome / comportamento alvo / observações
- Transferir paciente para outro terapeuta
- Excluir paciente (com confirmação, avisando que apaga registros vinculados)

**Aba Registros**
- Registros ABC e sessões de análise funcional de qualquer paciente, em tabela paginada
- Excluir registro individual (com confirmação)

**Resumo no topo**: total de terapeutas, pacientes, registros ABC e sessões.

Visual e idioma seguem o app atual (PT-BR, paleta clínica calma).

## Detalhes técnicos

- Migração: política que permite ao admin ler `profiles` de todos (a leitura pesada usa privilégio de serviço); nenhuma política existente de terapeuta é alterada. Papel `admin` atribuído ao seu usuário.
- `src/lib/admin.functions.ts`: funções de servidor com `requireSupabaseAuth` + checagem `has_role(userId, 'admin')` antes de carregar o cliente privilegiado dentro do handler. Uma função por operação (listar terapeutas, listar pacientes, atualizar/transferir/excluir paciente, listar/excluir registros, conceder/remover admin).
- `src/lib/admin-store.ts`: hooks React Query com os mesmos padrões de erro já usados (`describeDbError`, toasts, `mutateAsync`).
- `src/routes/_authenticated/admin.tsx`: rota nova com abas; redireciona para o painel normal se o usuário não for admin.
- Link "Administração" na navegação, visível só para admin.
- Nenhuma alteração no fluxo atual de terapeutas.
