"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log do erro para debugging
    console.error("Erro capturado:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-8 px-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-6">
        {/* Ilustração */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <img
              src="/ilustrations/undraw_construction-workers_z99i.svg"
              alt="Erro inesperado"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h1 className="text-3xl font-bold tracking-tight">
              Oops! Ocorreu um erro inesperado
            </h1>
          </div>

          <p className="text-muted-foreground text-lg">
            Algo deu errado. Por favor, tente novamente ou volte para a página inicial.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="bg-muted/50 rounded-lg p-4 border border-muted text-left">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button onClick={reset} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

