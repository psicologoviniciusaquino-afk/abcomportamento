# Ferramenta interativa: Identificação das 4 Funções do Comportamento

## Resumo
Nova aba "Funções" no app, com uma ferramenta direta e interativa para o terapeuta identificar rapidamente qual das 4 funções do comportamento (ABA) mantém um comportamento observável: **Sensorial**, **Esquiva/Fuga**, **Tangível** e **Atenção**.

## Estrutura da tela
Componente novo `src/components/aba/FunctionFinder.tsx`, com três blocos:

1. **Cards das 4 funções** (seleção por clique único)
   - Sensorial — estimulação física/sensorial interna, satisfação automática (ex.: enrolar cabelo, mexer dedos).
   - Esquiva / Fuga — término, adiamento ou remoção de demanda/tarefa/situação indesejada.
   - Tangível — acesso a item, brinquedo, alimento ou atividade.
   - Atenção — interação social, olhar ou resposta do outro.
   - Cada card: ícone objetivo, nome, descrição curta. Selecionar destaca o card e mostra feedback.

2. **Testador rápido de função** (4 perguntas Sim/Não)
   - Q1 "O comportamento continua acontecendo mesmo se a criança estiver sozinha?" → Sensorial
   - Q2 "Acontece logo após uma ordem, tarefa ou pedido ser feito?" → Esquiva
   - Q3 "Acontece quando um objeto/atividade é retirado ou negado?" → Tangível
   - Q4 "Acontece quando a atenção do adulto é direcionada a outra pessoa ou coisa?" → Atenção
   - Cada "Sim" soma um ponto para a função correspondente. Ao concluir, sugere a função com mais "Sim".

3. **Feedback visual + orientação de manejo**
   - Ao selecionar uma função (manual) ou concluir o testador, exibe um resultado destacado com:
     - nome da função e ícone
     - breve orientação prática de manejo (ex.: para Atenção — reforçar atenção contingente ao comportamento apropriado e extinção/ignorar o problema quando seguro).

## Decisões de implementação
- **Nova aba** no `Sidebar` (`TabKey` ganha `"functions"`, label "Funções", ícone `Target` do lucide-react) — mantém 5 itens no menu mobile (substituir/ajustar grid de 5 para 5 colunas já suporta; se ultrapassar, usar `grid-cols-5` como hoje). A aba atual são 5; adicionaremos uma 6ª → ajustar o nav mobile para `grid-cols-6`.
- Renderizar no `dashboard.tsx` quando `tab === "functions"`.
- Estado 100% local no componente (useState) — sem persistência, sem nuvem, por ser uma ferramenta de raciocínio clínico descartável.
- **Design:** tokens semânticos existentes (azul/verde suaves via `--primary`, `--success`, `bg-chart-*` já usados no Education). Cards grandes, toque amigável, responsivo (1 col no mobile, 2x2 no desktop).
- Feedback usa cores suaves e ícones lucide: `Sparkles` (Sensorial), `LogOut` (Esquiva), `Package` (Tangível), `MessageSquare` (Atenção) — reutilizando o conjunto já presente no Education.

## Escopo excluído
- Não salva a função inferida no banco nem em localStorage.
- Não substitui o conteúdo educacional da aba "Aprender".
- Não conecta ao logger ABC (apenas ferramenta de identificação autônoma).

## Arquivos a alterar
1. Criar `src/components/aba/FunctionFinder.tsx` (novo).
2. Editar `src/components/aba/Sidebar.tsx` — adicionar item "Funções" no `TabKey` e no array `items`; ajustar nav mobile para 6 colunas.
3. Editar `src/routes/_authenticated/dashboard.tsx` — importar e renderizar `FunctionFinder` para a aba nova.
4. Atualizar `roadmap.md`.

## Verificação
- Abrir a aba "Funções" autenticado: cards clicáveis, testador com 4 perguntas Sim/Não, resultado destacado com orientação. Confirmação visual via screenshot.
