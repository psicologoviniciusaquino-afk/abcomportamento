# Remoção do seletor Linha de Base / Intervenção

## Situação atual
A alteração já foi aplicada em `src/components/aba/QuickLogger.tsx` (antes da interrupção por créditos):

- Removido o bloco do seletor segmentado "Linha de Base / Intervenção".
- O `phase` passou a ser uma constante (`"baseline"`), sem o `useState`/`setPhase`.
- O botão único "Registrar comportamento" permanece no rodapé, sem ícone.

## Por que "não vi funcionar"
A mudança só não foi confirmada visualmente porque a verificação exigia entrar autenticado e o mint de sessão foi interrompido. O código em si está salvo.

## Único passo restante
Confirmar visualmente (entrar autenticado e abrir a aba Sessão) que o seletor sumiu e o botão "Registrar comportamento" continua único. Nenhuma alteração adicional de código é necessária.
