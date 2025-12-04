"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-8 px-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Ilustração */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <img
              src="/ilustrations/undraw_developer-avatar_f6ac.svg"
              alt="Acesso negado"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Mensagem de Acesso Negado */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <ShieldX className="h-8 w-8 text-destructive" />
            <h1 className="text-6xl font-bold tracking-tight text-foreground">
              403
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Acesso Negado
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Você não tem permissão para acessar esta página. Esta área é restrita e requer permissões específicas.
          </p>
        </div>

        {/* Botões de navegação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild variant="default" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}

