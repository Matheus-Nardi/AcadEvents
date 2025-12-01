"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Globe, 
  Plus, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ListTree
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { eventoService } from "@/lib/services/evento/EventoService";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { Evento } from "@/types/evento/Evento";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    SubmissoesAbertas: {
      label: "Submissões Abertas",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    SubmissoesEncerradas: {
      label: "Submissões Encerradas",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <AlertCircle className="h-3 w-3" />
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: <AlertCircle className="h-3 w-3" />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function EventosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showNoTrilhasModal, setShowNoTrilhasModal] = React.useState(false);
  const [isCheckingTrilhas, setIsCheckingTrilhas] = React.useState(false);

  React.useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const data = await eventoService.getMeusEventos();
        setEventos(data);
      } catch (error: any) {
        console.error("Erro ao buscar eventos:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar eventos. Tente novamente.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const handleCreateEventoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setIsCheckingTrilhas(true);
      const trilhas = await trilhaService.getAll();
      
      if (trilhas.length === 0) {
        setShowNoTrilhasModal(true);
        setIsCheckingTrilhas(false);
        return;
      }

      // Verifica se alguma trilha tem trilhas temáticas
      let hasTrilhaComTematicas = false;
      for (const trilha of trilhas) {
        try {
          const tematicas = await trilhaService.getByTrilhaId(trilha.id);
          if (tematicas.length > 0) {
            hasTrilhaComTematicas = true;
            break;
          }
        } catch (error) {
          console.error(`Erro ao verificar trilhas temáticas da trilha ${trilha.id}:`, error);
        }
      }

      if (!hasTrilhaComTematicas) {
        setShowNoTrilhasModal(true);
      } else {
        router.push("/painel/organizador/criar-evento");
      }
    } catch (error) {
      console.error("Erro ao verificar trilhas:", error);
      toast.error("Erro ao verificar trilhas disponíveis");
    } finally {
      setIsCheckingTrilhas(false);
    }
  };

  const handleRedirectToCreateTrilha = () => {
    router.push("/painel/organizador/criar-trilha");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Dialog open={showNoTrilhasModal} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <DialogTitle className="text-center">Trilhas Necessárias</DialogTitle>
            <DialogDescription className="text-center">
              Para criar um evento, é necessário ter pelo menos uma trilha com trilhas temáticas cadastradas.
              <br />
              <br />
              Por favor, crie uma trilha primeiro antes de criar um evento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleRedirectToCreateTrilha} className="w-full sm:w-auto">
              <ListTree className="mr-2 h-4 w-4" />
              Criar Trilha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                Meus Eventos
              </h1>
              <p className="text-muted-foreground">
                Gerencie e acompanhe todos os seus eventos acadêmicos
              </p>
            </div>
          </div>
          <Button 
            onClick={handleCreateEventoClick}
            disabled={isCheckingTrilhas}
          >
            {isCheckingTrilhas ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Criar Novo Evento
              </>
            )}
          </Button>
        </div>

      {/* Stats */}
      {eventos.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{eventos.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de Eventos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {eventos.filter(e => e.statusEvento === "SubmissoesAbertas").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Submissões Abertas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {eventos.filter(e => e.statusEvento === "SubmissoesEncerradas").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Submissões Encerradas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Eventos Grid */}
      {eventos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Você ainda não criou nenhum evento. Comece criando seu primeiro evento acadêmico!
            </p>
            <Button 
              onClick={handleCreateEventoClick}
              disabled={isCheckingTrilhas}
            >
              {isCheckingTrilhas ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Evento
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {evento.nome}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {evento.descricao}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-3">
                  {getStatusBadge(evento.statusEvento)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">Início:</p>
                    <p className="font-medium">{formatDate(evento.dataInicio)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">Fim:</p>
                    <p className="font-medium">{formatDate(evento.dataFim)}</p>
                  </div>
                </div>

                {evento.local && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground">Local:</p>
                      <p className="font-medium line-clamp-1">{evento.local}</p>
                    </div>
                  </div>
                )}

                {evento.site && (
                  <div className="flex items-start gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={evento.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline line-clamp-1"
                      >
                        {evento.site}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/eventos/${evento.id}`)}
                >
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

