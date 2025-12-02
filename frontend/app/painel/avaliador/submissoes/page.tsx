"use client"

import React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  Calendar,
  Tag,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { submissaoService } from "@/lib/services/submissao/SubmissaoService";
import { Submissao } from "@/types/submissao/Submissao";
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao";
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

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatusBadge = (status: StatusSubmissao) => {
  const statusConfig: Record<StatusSubmissao, { label: string; className: string; icon: React.ReactNode }> = {
    [StatusSubmissao.SUBMETIDA]: {
      label: "Submetida",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: <Clock className="h-3 w-3" />
    },
    [StatusSubmissao.EM_AVALIACAO]: {
      label: "Em Avaliação",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <Clock className="h-3 w-3" />
    },
    [StatusSubmissao.APROVADA]: {
      label: "Aprovada",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    [StatusSubmissao.APROVADA_COM_RESSALVAS]: {
      label: "Aprovada com Ressalvas",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      icon: <AlertCircle className="h-3 w-3" />
    },
    [StatusSubmissao.REJEITADA]: {
      label: "Rejeitada",
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

const getFormatoBadge = (formato: string) => {
  const formatoConfig: Record<string, { label: string; className: string }> = {
    ARTIGO_COMPLETO: {
      label: "Artigo Completo",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    ARTIGO_RESUMIDO: {
      label: "Artigo Resumido",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    POSTER: {
      label: "Pôster",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
    RESUMO_EXPANDIDO: {
      label: "Resumo Expandido",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    WORKSHOP: {
      label: "Workshop",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
  };

  const config = formatoConfig[formato] || {
    label: formato,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function AvaliadorSubmissoesPage() {
  const router = useRouter();
  const [submissoes, setSubmissoes] = React.useState<Submissao[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadSubmissoes = async () => {
    try {
      setLoading(true);
      const data = await submissaoService.getSubmissoesParaAvaliador();
      setSubmissoes(data);
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        "Erro ao carregar submissões. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSubmissoes();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submissões para Avaliação</h1>
        <p className="text-muted-foreground">
          Aqui você encontra todas as submissões atribuídas para sua avaliação.
        </p>
      </div>

      <div className="mb-4 flex justify-end">
        <Button variant="outline" onClick={loadSubmissoes} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : submissoes.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma submissão para avaliar</h3>
            <p className="text-sm text-muted-foreground text-center">
              Você não possui submissões atribuídas para avaliação no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissoes.map((submissao) => (
            <Card
              key={submissao.id}
              className="hover:shadow-md transition-shadow overflow-hidden"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2 line-clamp-2">
                      {submissao.titulo}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {submissao.resumo}
                    </CardDescription>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(submissao.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Tag className="h-3 w-3" />
                      Formato
                    </div>
                    <div>
                      {getFormatoBadge(submissao.formato)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      Submetida em
                    </div>
                    <div className="text-sm">
                      {formatDateShort(submissao.dataSubmissao)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Tag className="h-3 w-3" />
                      Trilha Temática
                    </div>
                    <div className="text-sm truncate">
                      {submissao.trilhaTematicaNome || `ID: ${submissao.trilhaTematicaId}`}
                    </div>
                  </div>
                </div>

                {submissao.palavrasChave && submissao.palavrasChave.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Palavras-chave
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {submissao.palavrasChave.map((palavra, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {palavra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  variant="default"
                  onClick={() => router.push(`/painel/avaliador/submissoes/${submissao.id}`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar e Avaliar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
