"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-8 px-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Ilustração */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <img
              src="/ilustrations/undraw_coffee-time_98vi.svg"
              alt="Página não encontrada"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Mensagem 404 */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            404
          </h1>
          <p className="text-xl text-muted-foreground">
            Página não encontrada
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
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
            <Link href="/eventos">
              <Search className="mr-2 h-4 w-4" />
              Ver Eventos
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

