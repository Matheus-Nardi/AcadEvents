"use client"

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Globe, 
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import { eventoService } from "@/lib/services/evento/EventoService";
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
import { Input } from "@/components/ui/input";
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

export default function HomePage() {
  const router = useRouter();
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [filteredEventos, setFilteredEventos] = React.useState<Evento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const data = await eventoService.getAll();
        setEventos(data);
        setFilteredEventos(data);
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

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEventos(eventos);
      return;
    }

    const filtered = eventos.filter((evento) => {
      const query = searchQuery.toLowerCase();
      return (
        evento.nome.toLowerCase().includes(query) ||
        evento.descricao.toLowerCase().includes(query) ||
        evento.local?.toLowerCase().includes(query) ||
        evento.statusEvento.toLowerCase().includes(query)
      );
    });

    setFilteredEventos(filtered);
  }, [searchQuery, eventos]);

  // Filtrar apenas eventos ativos para destacar
  const eventosAtivos = filteredEventos.filter(
    (e) => e.statusEvento === "SubmissoesAbertas"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Eventos Acadêmicos
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Descubra e participe dos melhores eventos acadêmicos do Brasil
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar eventos por nome, descrição ou local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{eventos.length} eventos disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{eventosAtivos.length} eventos ativos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Eventos em Destaque (Ativos) */}
        {eventosAtivos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Eventos em Destaque</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosAtivos.slice(0, 6).map((evento) => (
                <Card 
                  key={evento.id} 
                  className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group"
                  onClick={() => router.push(`/eventos/${evento.id}`)}
                >
                  {evento.logo && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg shrink-0">
                      <img
                        src={evento.logo}
                        alt={evento.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(evento.statusEvento)}
                      </div>
                    </div>
                  )}
                  <CardHeader className={!evento.logo ? "pb-3 shrink-0" : "shrink-0"}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {evento.nome}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {evento.descricao}
                        </CardDescription>
                      </div>
                      {!evento.logo && (
                        <div className="shrink-0">
                          {getStatusBadge(evento.statusEvento)}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground">Início:</p>
                        <p className="font-medium">{formatDate(evento.dataInicio)}</p>
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
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:underline line-clamp-1"
                          >
                            {evento.site}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t pt-4 shrink-0">
                    <Button
                      variant="default"
                      className="w-full group-hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/eventos/${evento.id}`);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Todos os Eventos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold">
                {searchQuery ? `Resultados da Busca (${filteredEventos.length})` : "Todos os Eventos"}
              </h2>
            </div>
          </div>

          {filteredEventos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "Nenhum evento encontrado" : "Nenhum evento disponível"}
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {searchQuery
                    ? "Tente ajustar sua busca ou limpe o filtro para ver todos os eventos."
                    : "Ainda não há eventos cadastrados. Volte em breve para descobrir novos eventos acadêmicos!"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Limpar Busca
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEventos.map((evento) => (
                <Card 
                  key={evento.id} 
                  className="flex flex-col h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/eventos/${evento.id}`)}
                >
                  {evento.logo && (
                    <div className="relative h-40 w-full overflow-hidden rounded-t-lg shrink-0">
                      <img
                        src={evento.logo}
                        alt={evento.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(evento.statusEvento)}
                      </div>
                    </div>
                  )}
                  <CardHeader className={!evento.logo ? "pb-3 shrink-0" : "shrink-0"}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {evento.nome}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {evento.descricao}
                        </CardDescription>
                      </div>
                      {!evento.logo && (
                        <div className="shrink-0">
                          {getStatusBadge(evento.statusEvento)}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground">Início:</p>
                        <p className="font-medium">{formatDate(evento.dataInicio)}</p>
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
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:underline line-clamp-1"
                          >
                            {evento.site}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t pt-4 shrink-0">
                    <Button
                      variant="outline"
                      className="w-full group-hover:border-primary group-hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/eventos/${evento.id}`);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
