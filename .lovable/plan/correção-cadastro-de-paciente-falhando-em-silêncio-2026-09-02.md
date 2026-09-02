# Correção: cadastro de paciente falhando em silêncio

## O que eu verifiquei no banco

Consultei as políticas e permissões reais do projeto:

- Tabela de pacientes (`children`): política `Owner can manage own children` já cobre todas as operações para usuários autenticados, com a regra `auth.uid() = owner_id` tanto na leitura quanto na gravação. Também existe uma política de administrador.
- Permissões de acesso da API estão presentes para `authenticated` e `service_role`.
- Não existe tabela de vínculo terapeuta/paciente separada nem coluna `therapist_id`: o vínculo é a coluna `owner_id`, preenchida no servidor com o id do usuário autenticado.
- Existem 25 pacientes gravados, o mais recente em 01/09/2026 — ou seja, a inserção funciona quando a requisição chega autenticada.

**Conclusão:** o RLS não é a causa. O modelo já é exatamente o simples que você pediu (terapeuta autenticado vê e cria apenas os seus). A causa provável está no frontend: as mutações são disparadas sem esperar resposta e sem tratamento de erro, então qualquer falha (sessão expirada, 401 na chamada ao servidor, erro de rede, validação) desaparece — e o app ainda mostra "Paciente adicionado" mesmo quando nada foi salvo.

## O que será corrigido

1. **Toast de sucesso deixa de ser otimista**
   Em `QuickLogger` (botão "+ Novo") e no `Logger`, o aviso de "Paciente adicionado" só aparece depois da confirmação do servidor. Em caso de falha, aparece um toast de erro com a mensagem real.

2. **Tratamento de erro em todas as mutações**
   Adicionar `onError` nas mutações de pacientes, registros ABC e sessões: toast de erro em português com a mensagem retornada e `console.error` com o detalhe completo para debug.

3. **Erros de RLS/servidor com mensagem clara**
   No servidor, os erros do banco passam a ser convertidos em mensagens legíveis, distinguindo três casos: sessão expirada / não autenticado, permissão negada pelas regras de acesso, e erro genérico — em vez de o erro cru ser engolido.

4. **Falha de carregamento visível na listagem**
   Se a listagem de pacientes falhar, a interface mostra um aviso de erro com botão "Tentar novamente" em vez de exibir uma lista vazia como se não houvesse pacientes.

5. **Nada de supervisor/hierarquia**
   Nenhuma alteração no modelo de papéis. As políticas atuais permanecem como estão — não é necessária migração.

## Teste após a correção

Vou rodar o fluxo completo no navegador com uma sessão autenticada: abrir a aba Sessão, criar um paciente novo, confirmar que ele aparece no seletor e na listagem, e conferir no banco que a linha foi gravada com o `owner_id` correto. Também vou simular uma falha (sessão sem token) para confirmar que agora aparece um erro visível em vez de silêncio.

## Detalhes técnicos

- Arquivos: `src/lib/aba-store.ts` (hooks `useChildren`/`useLogs`/`useFASessions` — trocar `mutate` por `mutateAsync` onde o toast depende do resultado, adicionar `onError`), `src/components/aba/QuickLogger.tsx`, `src/components/aba/Logger.tsx`, `src/lib/aba.server.ts` (normalizar `PostgrestError`, incluindo código `42501`/RLS).
- Sem migração de banco: políticas e GRANTs de `children` já estão corretos.
