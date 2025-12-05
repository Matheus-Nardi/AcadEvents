"use client"

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  Loader2,
  User,
  ListTree,
  Tag,
  FileText
} from "lucide-react";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { Trilha } from "@/types/trilha/Trilha";
import { TrilhaTematica } from "@/types/trilha-tematica/TrilhaTematica";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TrilhaDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const trilhaId = Number(params.id);
  
  const [trilha, setTrilha] = React.useState<Trilha | null>(null);
  const [trilhasTematicas, setTrilhasTematicas] = React.useState<TrilhaTematica[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingTematicas, setLoadingTematicas] = React.useState(true);

  React.useEffect(() => {
    const fetchTrilha = async () => {
      if (!trilhaId || isNaN(trilhaId)) {
        toast.error("ID da trilha inválido");
        router.push("/painel/organizador/trilhas");
        return;
      }

      try {
        setLoading(true);
        const data = await trilhaService.getById(trilhaId);
        setTrilha(data);
      } catch (error: any) {
        console.error("Erro ao buscar trilha:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar trilha. Tente novamente.";
        toast.error(errorMessage);
        router.push("/painel/organizador/trilhas");
      } finally {
        setLoading(false);
      }
    };

    const fetchTematicas = async () => {
      if (!trilhaId || isNaN(trilhaId)) return;

      try {
        setLoadingTematicas(true);
        const data = await trilhaService.getByTrilhaId(trilhaId);
        setTrilhasTematicas(data);
      } catch (error: any) {
        console.error("Erro ao buscar trilhas temáticas:", error);
        setTrilhasTematicas([]);
      } finally {
        setLoadingTematicas(false);
      }
    };

    fetchTrilha();
    fetchTematicas();
  }, [trilhaId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trilha) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/painel/organizador/trilhas")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {trilha.nome}
          </h1>
          <p className="text-muted-foreground">
            Detalhes da trilha
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {trilha.descricao || "Nenhuma descrição disponível."}
              </p>
            </CardContent>
          </Card>

          {/* Trilhas Temáticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTree className="h-5 w-5" />
                Trilhas Temáticas
              </CardTitle>
              <CardDescription>
                Trilhas temáticas associadas a esta trilha
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTematicas ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : trilhasTematicas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma trilha temática encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trilhasTematicas.map((tematica) => (
                    <Card key={tematica.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-2">
                              {tematica.nome}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {tematica.descricao}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tematica.palavrasChave && tematica.palavrasChave.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tematica.palavrasChave.map((palavra, index) => (
                              <Badge key={index} variant="secondary">
                                <Tag className="h-3 w-3 mr-1" />
                                {palavra}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/painel/organizador/trilhas-tematicas/${tematica.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Informações Adicionais */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Coordenador</p>
                  <p className="font-medium">{trilha.coordenador}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{trilhasTematicas.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trilhas Temáticas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

