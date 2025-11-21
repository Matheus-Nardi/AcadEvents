"use client"

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users,
  Plus, 
  Loader2,
  FileText,
  Briefcase,
  ArrowLeft
} from "lucide-react";
import { comiteCientificoService } from "@/lib/services/comite-cientifico/ComiteCientificoService";
import { ComiteCientifico } from "@/types/comite-cientifico/ComiteCientifico";
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

const getTipoBadge = (tipo: string) => {
  const tipoConfig: Record<string, { label: string; className: string }> = {
    Cientifico: {
      label: "Científico",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    Organizacao: {
      label: "Organização",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    Revisao: {
      label: "Revisão",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
  };

  const config = tipoConfig[tipo] || {
    label: tipo,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function ComitesPage() {
  const router = useRouter();
  const [comites, setComites] = React.useState<ComiteCientifico[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchComites = async () => {
      try {
        setLoading(true);
        const data = await comiteCientificoService.getAll();
        setComites(data);
      } catch (error: any) {
        console.error("Erro ao buscar comitês científicos:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar comitês científicos. Tente novamente.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchComites();
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
              Comitês Científicos
            </h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todos os comitês científicos
            </p>
          </div>
        </div>
        <Button asChild disabled>
          <Link href="#">
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Comitê
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {comites.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{comites.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de Comitês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {comites.reduce((sum, c) => sum + (c.avaliadoresIds?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de Avaliadores
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {comites.reduce((sum, c) => sum + (c.coordenadoresIds?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de Coordenadores
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comitês Grid */}
      {comites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum comitê encontrado</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Os comitês científicos são criados automaticamente durante a criação de eventos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comites.map((comite) => (
            <Card key={comite.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {comite.nome}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mb-3">
                      {comite.descricao}
                    </CardDescription>
                    <div className="mt-2">
                      {getTipoBadge(comite.tipo)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Avaliadores:</span>
                    <span className="font-medium">
                      {comite.avaliadoresIds?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Coordenadores:</span>
                    <span className="font-medium">
                      {comite.coordenadoresIds?.length || 0}
                    </span>
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

