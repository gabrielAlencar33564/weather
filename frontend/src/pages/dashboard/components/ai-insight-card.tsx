import React from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

type AiInsightCardProps = {
  insight: string;
  error: string | null;
  isLoading: boolean;
};

export const AiInsightCard: React.FC<AiInsightCardProps> = ({
  insight,
  error,
  isLoading,
}) => {
  const hasError = !!error;

  const statusClasses = hasError
    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200"
    : isLoading
    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/30 dark:text-amber-200"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200";

  const statusDotClasses = hasError
    ? "bg-red-500"
    : isLoading
    ? "bg-amber-500 animate-pulse"
    : "bg-emerald-500";

  const statusText = hasError ? "Erro na IA" : isLoading ? "Gerando insight" : "IA ativa";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            {hasError ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
              Insight inteligente do clima
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {hasError
                ? "Falha ao gerar análise com IA"
                : "Análise gerada automaticamente pela IA"}
            </span>
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border ${statusClasses}`}
        >
          <span className={`mr-1 h-1.5 w-1.5 rounded-full ${statusDotClasses}`} />
          {statusText}
        </span>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mt-3 rounded-lg border border-border/60 bg-muted/40 p-3 text-sm leading-relaxed text-foreground dark:border-border/60 dark:bg-background/40">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ) : hasError ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium text-red-700 dark:text-red-300">
                Nao foi possivel gerar o insight de clima no momento.
              </p>
              <p className="text-xs text-muted-foreground">Detalhes: {error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente novamente em alguns instantes ou atualize a pagina.
              </p>
            </div>
          ) : (
            <p>
              <span className="mr-1 text-lg text-primary/80">“</span>
              {insight}
              <span className="ml-1 text-lg text-primary/80">”</span>
            </p>
          )}
        </div>

        {!isLoading && !hasError && (
          <p className="mt-3 text-xs text-muted-foreground">
            Insight gerado com base nos registros mais recentes de temperatura, umidade,
            vento e probabilidade de chuva da sua regiao.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
