import {
  MessageCircle, MessagesSquare, HandHeart, ToyBrick, Apple, OctagonX, Pause, HandHelping, DoorOpen,
  EyeOff, PackageMinus, CircleSlash, Compass, MessageSquareText, Hand, PersonStanding, Ban, BookOpen,
  Brush, Repeat, ClipboardList, Frown, UserMinus, Hourglass, Eye, Users, User, Volume2, Square,
  Thermometer, Lightbulb, Moon, Utensils, Box, UserRound, Zap, Bandage, Megaphone, Footprints,
  RotateCw, X, PenLine, Globe, Tag, type LucideIcon,
} from "lucide-react";
import { cn } from "./utils";

/** Set único de ícones outline (lucide) para todos os chips do app. */
export const TAG_ICONS: Record<string, LucideIcon> = {
  // Antecedentes
  "Demanda acadêmica": BookOpen,
  "Demanda de rotina": Brush,
  "Transição de atividade": Repeat,
  "Instrução/demanda": ClipboardList,
  "Atividade aversiva": Frown,
  "Retirada de atenção": UserMinus,
  "Restrição de acesso": Ban,
  "Atraso/espera por item": Hourglass,
  "Desvio de atenção": Eye,
  "Interação social": Users,
  "Objeto preferido": ToyBrick,
  "Presença de outra pessoa": User,
  "Excesso de estímulos (barulho/luz)": Volume2,
  "Sozinho / sem demandas": Square,
  "Sozinho(a)": UserRound,
  "Desconforto físico (fome, sono, dor)": Thermometer,
  Outro: PenLine,
  // Consequências
  "Atenção social": MessageCircle,
  "Atenção verbal direta (bronca/consolo)": MessagesSquare,
  "Contato físico / proximidade": HandHeart,
  "Acesso ao objeto preferido": ToyBrick,
  "Entrega do objeto/alimento preferido": Apple,
  "Retirada da tarefa": OctagonX,
  "Retirada da tarefa / pausa": Pause,
  "Redução da exigência (ajuda total)": HandHelping,
  "Retirada do ambiente": DoorOpen,
  "Retirada da atenção": EyeOff,
  "Retirada do objeto preferido": PackageMinus,
  "Nenhuma consequência social visível": CircleSlash,
  Redirecionamento: Compass,
  "Modelagem de mando": MessageSquareText,
  "Bloqueio físico": Hand,
  "Evasão (saída/fuga do contexto)": PersonStanding,
  "Retirada de objetos tangíveis": Ban,
  // Ambiente
  "Ambiente barulhento": Volume2,
  "Muitas pessoas": Users,
  "Iluminação intensa": Lightbulb,
  "Mudança de rotina": Repeat,
  "Cansaço/sono": Moon,
  Fome: Utensils,
  "Calor/frio": Thermometer,
  "Espaço restrito": Box,
  "Presença de estranhos": User,
  "Sem acesso a reforçador": Ban,
  // Comportamentos
  Agressão: Zap,
  Autolesão: Bandage,
  "Choro/grito": Megaphone,
  "Fuga/esquiva": Footprints,
  Estereotipia: RotateCw,
  Recusa: X,
  // Seções
  Ambiente: Globe,
};

export function TagIcon({ name, className }: { name: string; className?: string }) {
  const Icon = TAG_ICONS[name] ?? Tag;
  return <Icon className={cn("size-3.5 shrink-0", className)} strokeWidth={2} />;
}
