"use client"

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ListTree,
  Plus, 
  Loader2,
  User,
  Hash,
  ArrowLeft
} from "lucide-react";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { Trilha } from "@/types/trilha/Trilha";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function TrilhasPage() {
  const router = useRouter();
  const [trilhas, setTrilhas] = React.useState<Trilha[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTrilhas = async () => {
      try {
        setLoading(true);
        const data = await trilhaService.getAll();
        setTrilhas(data);
      } catch (error: any) {
        console.error("Erro ao buscar trilhas:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar trilhas. Tente novamente.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTrilhas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/painel/organizador")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Trilhas
            </h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todas as trilhas
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/painel/organizador/criar-trilha">
            <Plus className="mr-2 h-4 w-4" />
            Criar Nova Trilha
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {trilhas.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{trilhas.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de Trilhas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {trilhas.filter(t => t.eventoId).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Trilhas Associadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {trilhas.filter(t => !t.eventoId).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Trilhas Independentes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trilhas Grid */}
      {trilhas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTree className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma trilha encontrada</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Você ainda não criou nenhuma trilha. Comece criando sua primeira trilha!
            </p>
            <Button asChild>
              <Link href="/painel/organizador/criar-trilha">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Trilha
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trilhas.map((trilha) => (
            <Card key={trilha.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {trilha.nome}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {trilha.descricao}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">Coordenador:</p>
                    <p className="font-medium">{trilha.coordenador}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">Limite de Submissões:</p>
                    <p className="font-medium">{trilha.limiteSubmissoes}</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      
    </div>
  );
}

