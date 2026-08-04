import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

type Props = { showHome?: boolean; className?: string };

/** Setas de navegação (voltar / avançar) — usadas no canto superior esquerdo. */
export function NavArrows({ showHome = true, className = "" }: Props) {
  const navigate = useNavigate();

  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate({ to: "/" });
  };

  const forward = () => {
    if (typeof window !== "undefined") window.history.forward();
  };

  const btn =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-foreground";

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button type="button" onClick={back} className={btn} aria-label="Voltar" title="Voltar (Alt+←)">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={forward}
        className={btn}
        aria-label="Avançar"
        title="Avançar (Alt+→)"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
      {showHome && (
        <button
          type="button"
          onClick={() => navigate({ to: "/painel" })}
          className={btn}
          aria-label="Ir para o painel"
          title="Painel"
        >
          <Home className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
