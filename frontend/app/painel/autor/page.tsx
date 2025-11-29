"use client"

import React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  Calendar,
  Tag,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  FileCheck,
  FileX,
  FileEdit
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
      icon: <Upload className="h-3 w-3" />
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

export default function AutorPage() {
  const router = useRouter();
  const [submissoes, setSubmissoes] = React.useState<Submissao[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadSubmissoes = async () => {
    try {
      setLoading(true);
      const data = await submissaoService.getMinhasSubmissoes();
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

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta submissão?")) {
      return;
    }

    try {
      await submissaoService.delete(id);
      toast.success("Submissão excluída com sucesso");
      await loadSubmissoes();
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        "Erro ao excluir submissão. Tente novamente.";
      toast.error(errorMessage);
    }
  };

  const submetidas = submissoes.filter(s => s.status === StatusSubmissao.SUBMETIDA);
  const emAvaliacao = submissoes.filter(s => s.status === StatusSubmissao.EM_AVALIACAO);
  const aprovadas = submissoes.filter(s => 
    s.status === StatusSubmissao.APROVADA || s.status === StatusSubmissao.APROVADA_COM_RESSALVAS
  );
  const rejeitadas = submissoes.filter(s => s.status === StatusSubmissao.REJEITADA);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Painel do Autor</h1>
        <p className="text-muted-foreground">Gerencie e acompanhe todas as suas submissões</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : submissoes.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma submissão encontrada</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Você ainda não possui submissões. Comece criando uma nova submissão em um evento.
                </p>
                <Button onClick={() => router.push("/")}>
                  Explorar Eventos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissoes.map((submissao) => (
                <Card key={submissao.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{submissao.titulo}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2 mb-3">
                          {submissao.resumo}
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(submissao.status)}
                          {getFormatoBadge(submissao.formato)}
                          {submissao.versao > 1 && (
                            <span className="text-xs text-muted-foreground">
                              Versão {submissao.versao}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {submissao.trilhaTematicaNome && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3 w-3" />
                              <span>{submissao.trilhaTematicaNome}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>Submetida em {formatDateShort(submissao.dataSubmissao)}</span>
                          </div>
                          {submissao.dataUltimaModificacao && (
                            <div className="flex items-center gap-1.5">
                              <Edit className="h-3 w-3" />
                              <span>Atualizada em {formatDateShort(submissao.dataUltimaModificacao)}</span>
                            </div>
                          )}
                        </div>
                        {submissao.palavrasChave && submissao.palavrasChave.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {submissao.palavrasChave.map((palavra, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                              >
                                {palavra}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="border-t pt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        router.push(`/painel/autor/submissao/${submissao.id}`);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{submissoes.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Total de Submissões</p>
              </div>
              <div className="pt-4 border-t space-y-3">
                <div>
                  <div className="text-xl font-semibold">{submetidas.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Submetidas</p>
                </div>
                <div>
                  <div className="text-xl font-semibold">{emAvaliacao.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Em Avaliação</p>
                </div>
                <div>
                  <div className="text-xl font-semibold text-green-600">{aprovadas.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Aprovadas</p>
                </div>
                <div>
                  <div className="text-xl font-semibold text-red-600">{rejeitadas.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Rejeitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Nova Submissão
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

