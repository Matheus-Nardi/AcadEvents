"use client"

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Globe, 
  Image as ImageIcon,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Users,
  ListTree,
  Briefcase,
  User,
  Hash,
  Eye,
  RefreshCw,
  FileText,
  Tag,
  Upload,
  Layers
} from "lucide-react";
import { eventoService } from "@/lib/services/evento/EventoService";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { Evento } from "@/types/evento/Evento";
import { TrilhaTematica } from "@/types/trilha-tematica/TrilhaTematica";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    Planejamento: {
      label: "Planejamento",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: <Clock className="h-3 w-3" />
    },
    InscricoesAbertas: {
      label: "Inscrições Abertas",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    InscricoesEncerradas: {
      label: "Inscrições Encerradas",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <AlertCircle className="h-3 w-3" />
    },
    EmAndamento: {
      label: "Em Andamento",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      icon: <Clock className="h-3 w-3" />
    },
    Encerrado: {
      label: "Encerrado",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    Cancelado: {
      label: "Cancelado",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <XCircle className="h-3 w-3" />
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const isOrganizador = (user: any): boolean => {
  return user && 'cargo' in user && 'permissoes' in user;
};

const isAutor = (user: any): boolean => {
  return user && 'biografia' in user && 'areaAtuacao' in user && 'lattes' in user;
};

export default function EventoDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const eventoId = Number(params.id);
  
  const [evento, setEvento] = React.useState<Evento | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [trilhasTematicas, setTrilhasTematicas] = React.useState<Record<number, TrilhaTematica[]>>({});
  const [loadingTematicas, setLoadingTematicas] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    const fetchEvento = async () => {
      if (!eventoId || isNaN(eventoId)) {
        toast.error("ID do evento inválido");
        router.push("/eventos");
        return;
      }

      try {
        setLoading(true);
        const data = await eventoService.getById(eventoId);
        setEvento(data);
        
        // Buscar trilhas temáticas para cada trilha
        if (data.trilhas && data.trilhas.length > 0) {
          const tematicasMap: Record<number, TrilhaTematica[]> = {};
          const loadingMap: Record<number, boolean> = {};
          
          for (const trilha of data.trilhas) {
            loadingMap[trilha.id] = true;
            try {
              const tematicas = await trilhaService.getByTrilhaId(trilha.id);
              tematicasMap[trilha.id] = tematicas;
            } catch (error) {
              console.error(`Erro ao buscar trilhas temáticas da trilha ${trilha.id}:`, error);
              tematicasMap[trilha.id] = [];
            } finally {
              loadingMap[trilha.id] = false;
            }
          }
          
          setTrilhasTematicas(tematicasMap);
          setLoadingTematicas(loadingMap);
        }
      } catch (error: any) {
        console.error("Erro ao buscar evento:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar evento. Tente novamente.";
        toast.error(errorMessage);
        router.push("/eventos");
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [eventoId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Evento não encontrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => router.push("/eventos")}>
              Voltar para Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {evento.logo && (
                <img 
                  src={evento.logo} 
                  alt={`Logo ${evento.nome}`}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {evento.nome}
                </h1>
                <div className="flex items-center gap-2">
                  {getStatusBadge(evento.statusEvento)}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-lg">
              {evento.descricao}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Data de Início</p>
                    <p className="font-medium">{formatDate(evento.dataInicio)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Data de Fim</p>
                    <p className="font-medium">{formatDate(evento.dataFim)}</p>
                  </div>
                </div>

                {evento.local && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Local</p>
                      <p className="font-medium">{evento.local}</p>
                    </div>
                  </div>
                )}

                {evento.site && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Site</p>
                      <a
                        href={evento.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {evento.site}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuração */}
          {evento.configuracao && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Configuração do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prazo de Submissão</p>
                    <p className="font-medium">{formatDateShort(evento.configuracao.prazoSubmissao)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prazo de Avaliação</p>
                    <p className="font-medium">{formatDateShort(evento.configuracao.prazoAvaliacao)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avaliadores por Submissão</p>
                    <p className="font-medium">{evento.configuracao.numeroAvaliadoresPorSubmissao}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Avaliação Duplo Cego</span>
                    {evento.configuracao.avaliacaoDuploCego ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Permite Resubmissão</span>
                    {evento.configuracao.permiteResubmissao ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trilhas */}
          {evento.trilhas && evento.trilhas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTree className="h-5 w-5" />
                  Trilhas 
                </CardTitle>
                <CardDescription>
                  Trilhas e trilhas temáticas associadas a este evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {evento.trilhas.map((trilha) => (
                    <Card key={trilha.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{trilha.nome}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {trilha.descricao}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Coordenador:</span>
                            <span className="font-medium">{trilha.coordenador}</span>
                          </div>
                        </div>

                        {/* Trilhas Temáticas */}
                        {loadingTematicas[trilha.id] ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : trilhasTematicas[trilha.id] && trilhasTematicas[trilha.id].length > 0 ? (
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center gap-2 mb-3">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-muted-foreground">
                                Trilhas Temáticas ({trilhasTematicas[trilha.id].length})
                              </span>
                            </div>
                            {trilhasTematicas[trilha.id].map((tematica) => (
                              <Card key={tematica.id} className="border bg-muted/30">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">{tematica.nome}</CardTitle>
                                  <CardDescription className="line-clamp-2 text-sm">
                                    {tematica.descricao}
                                  </CardDescription>
                                  {tematica.palavrasChave && tematica.palavrasChave.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {tematica.palavrasChave.map((palavra, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                                        >
                                          {palavra}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </CardHeader>
                                {isAutor(user) && (
                                  <CardContent>
                                    <Button
                                      className="w-full"
                                      onClick={() => {
                                        router.push(`/eventos/${eventoId}/submissao/${tematica.id}`);
                                      }}
                                    >
                                      <Upload className="mr-2 h-4 w-4" />
                                      FAZER SUBMISSÃO
                                    </Button>
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
                            <Layers className="h-5 w-5 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma trilha temática disponível</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comitês Científicos - Apenas para Organizadores */}
          {isOrganizador(user) && evento.comites && evento.comites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comitês Científicos ({evento.comites.length})
                </CardTitle>
                <CardDescription>
                  Comitês científicos associados a este evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evento.comites.map((comite) => (
                    <Card key={comite.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{comite.nome}</CardTitle>
                              {getTipoBadge(comite.tipo)}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {comite.descricao}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
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
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizadores */}
          {evento.organizadores && evento.organizadores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Organizadores ({evento.organizadores.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {evento.organizadores.map((organizador) => (
                    <div key={organizador.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{organizador.nome}</p>
                        <p className="text-sm text-muted-foreground">{organizador.email}</p>
                        {organizador.instituicao && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {organizador.instituicao}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

