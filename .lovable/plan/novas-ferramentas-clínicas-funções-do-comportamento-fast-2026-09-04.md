# Novas ferramentas clínicas: Funções do Comportamento + FAST

## Resumo
Adicionar duas novas abas interativas ao app, ambas ferramentas de raciocínio clínico ABA, com estado 100% local (sem nuvem, sem persistência):

1. **Funções** — identificação rápida das 4 funções do comportamento (Sensorial, Esquiva/Fuga, Tangível, Atenção).
2. **FAST** — Functional Analysis Screening Tool: questionário de 16 perguntas com pontuação automática e hipótese funcional primária.

---

## Aba 1 — Funções (`FunctionFinder.tsx`)

Três blocos:

1. **Cards das 4 funções** (clique único):
   - Sensorial — estimulação física/sensorial interna, satisfação automática.
   - Esquiva / Fuga — término/adiamento/remoção de demanda, tarefa ou situação indesejada.
   - Tangível — acesso a item, brinquedo, alimento ou atividade.
   - Atenção — interação social, olhar ou resposta do outro.
   - Cada card: ícone lucide, nome, descrição curta. Selecionar destaca e mostra feedback.

2. **Testador rápido** (4 perguntas Sim/Não):
   - Q1 "O comportamento continua acontecendo mesmo se a criança estiver sozinha?" → Sensorial
   - Q2 "Acontece logo após uma ordem, tarefa ou pedido ser feito?" → Esquiva
   - Q3 "Acontece quando um objeto/atividade é retirado ou negado?" → Tangível
   - Q4 "Acontece quando a atenção do adulto é direcionada a outra pessoa ou coisa?" → Atenção
   - Cada "Sim" soma ponto para a função. Ao concluir, sugere a função com mais "Sim".

3. **Feedback + orientação de manejo**:
   - Ao selecionar ou concluir o testador, exibe resultado destacado com nome, ícone e orientação prática de manejo (ex.: Atenção — reforçar atenção contingente ao comportamento apropriado, extinção/ignorar o problema quando seguro).

---

## Aba 2 — FAST (`FastTool.tsx`)

1. **Formulário de 16 perguntas**, cada item com botões/radio `[ Sim ] [ Não ] [ N/A ]`:
   - Item 14 tem campo de texto condicional ("Em caso afirmativo, liste:") exibido quando marcado "Sim".

2. **Pontuação automática em tempo real** (soma dos "Sim" por grupo):
   - Social (Atenção / Itens de preferência): itens 1–4
   - Social (Fuga de tarefas / Atividades): itens 5–8
   - Automático (Estimulação Sensorial): itens 9–12
   - Automático (Atenuação da dor / Fisiológico): itens 13–16
   - Card/tabela atualiza a cada resposta; mostra contagem respondida (ex.: 9/16).

3. **Resultado destacado**: categoria com maior pontuação = hipótese funcional primária; mostra o total (ex.: "3/4") e breve descrição. Empate mostra as categorias empatadas. Se nada respondido, placeholder neutro.

---

## Decisões de implementação
- **Dois novos itens no `Sidebar`**: `TabKey` ganha `"functions"` e `"fast"`; labels "Funções" e "FAST"; ícones `Target` e `ClipboardCheck` (lucide-react).
- **Nav mobile** hoje é `grid-cols-5` com 5 itens → passa a `grid-cols-7` (7 itens). Se 7 colunas ficarem apertadas, manter 7 com texto reduzido.
- Renderizar ambos no `dashboard.tsx` conforme `tab`.
- **Sem persistência**: ferramentas descartáveis de avaliação; nada salvo em nuvem/localStorage.
- **Design**: tokens semânticos existentes (azul/verde suaves). Ícones: `Sparkles` (Sensorial), `LogOut` (Esquiva), `Package` (Tangível), `MessageSquare` (Atenção) — reutilizando o conjunto do Education. Cards grandes, toque amigável, responsivo.
- Função utilitária compartilhada de pontuação pode ficar inline no componente FAST.

## Escopo excluído
- Não substitui o conteúdo da aba "Aprender".
- Não conecta ao logger ABC nem salva resultados.
- Não gera PDF do FAST.

## Arquivos a alterar
1. Criar `src/components/aba/FunctionFinder.tsx`.
2. Criar `src/components/aba/FastTool.tsx`.
3. Editar `src/components/aba/Sidebar.tsx` — `TabKey`, `items` (7 entradas) e nav mobile (`grid-cols-7`).
4. Editar `src/routes/_authenticated/dashboard.tsx` — importar e renderizar as duas abas.
5. Atualizar `roadmap.md`.

## Verificação
- Abrir autenticado: aba Funções (cards, testador, resultado) e aba FAST (16 perguntas, pontuação em tempo real, destaque da hipótese). Confirmação visual via screenshot.
