"use client"

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  Loader2,
  Tag,
  FileText,
  ListTree
} from "lucide-react";
import { trilhaTematicaService } from "@/lib/services/trilha-tematica/TrilhaTematicaService";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { TrilhaTematica } from "@/types/trilha-tematica/TrilhaTematica";
import { Trilha } from "@/types/trilha/Trilha";
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

export default function TrilhaTematicaDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const trilhaTematicaId = Number(params.id);
  
  const [trilhaTematica, setTrilhaTematica] = React.useState<TrilhaTematica | null>(null);
  const [trilha, setTrilha] = React.useState<Trilha | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingTrilha, setLoadingTrilha] = React.useState(false);

  React.useEffect(() => {
    const fetchTrilhaTematica = async () => {
      if (!trilhaTematicaId || isNaN(trilhaTematicaId)) {
        toast.error("ID da trilha temática inválido");
        router.push("/painel/organizador/trilhas");
        return;
      }

      try {
        setLoading(true);
        const data = await trilhaTematicaService.getById(trilhaTematicaId);
        setTrilhaTematica(data);
        
        // Buscar trilha associada se houver
        if (data.trilhaId) {
          setLoadingTrilha(true);
          try {
            const trilhaData = await trilhaService.getById(data.trilhaId);
            setTrilha(trilhaData);
          } catch (error) {
            console.error("Erro ao buscar trilha associada:", error);
          } finally {
            setLoadingTrilha(false);
          }
        }
      } catch (error: any) {
        console.error("Erro ao buscar trilha temática:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar trilha temática. Tente novamente.";
        toast.error(errorMessage);
        router.push("/painel/organizador/trilhas");
      } finally {
        setLoading(false);
      }
    };

    fetchTrilhaTematica();
  }, [trilhaTematicaId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trilhaTematica) {
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
            {trilhaTematica.nome}
          </h1>
          <p className="text-muted-foreground">
            Detalhes da trilha temática
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
                {trilhaTematica.descricao || "Nenhuma descrição disponível."}
              </p>
            </CardContent>
          </Card>

          {/* Palavras-chave */}
          {trilhaTematica.palavrasChave && trilhaTematica.palavrasChave.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Palavras-chave
                </CardTitle>
                <CardDescription>
                  Palavras-chave relacionadas a esta trilha temática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trilhaTematica.palavrasChave.map((palavra, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      <Tag className="h-3 w-3 mr-1" />
                      {palavra}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Informações Adicionais */}
        <div className="space-y-6">
          {trilha && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTree className="h-5 w-5" />
                  Trilha Associada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTrilha ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nome</p>
                      <p className="font-medium">{trilha.nome}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/painel/organizador/trilhas/${trilha.id}`}>
                        Ver Detalhes da Trilha
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

