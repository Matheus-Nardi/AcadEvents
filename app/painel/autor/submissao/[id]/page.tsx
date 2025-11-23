"use client"

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Tag,
  FileText,
  User,
  Layers,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  FileEdit,
  FileX,
  Hash,
  BookOpen,
  Link as LinkIcon,
  Copy,
  ExternalLink
} from "lucide-react";
import { submissaoService } from "@/lib/services/submissao/SubmissaoService";
import { Submissao } from "@/types/submissao/Submissao";
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

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

const getStatusBadge = (status: StatusSubmissao) => {
  const statusConfig: Record<StatusSubmissao, { label: string; className: string; icon: React.ReactNode }> = {
    [StatusSubmissao.RASCUNHO]: {
      label: "Rascunho",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      icon: <FileEdit className="h-3 w-3" />
    },
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
    [StatusSubmissao.RETIRADA]: {
      label: "Retirada",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      icon: <FileX className="h-3 w-3" />
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function SubmissaoDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const submissaoId = Number(params.id);

  const [submissao, setSubmissao] = React.useState<Submissao | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSubmissao = async () => {
      if (!submissaoId || isNaN(submissaoId)) {
        toast.error("ID da submissão inválido");
        router.push("/painel/autor");
        return;
      }

      try {
        setLoading(true);
        const data = await submissaoService.getById(submissaoId);
        setSubmissao(data);
      } catch (error: any) {
        console.error("Erro ao buscar submissão:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar submissão. Tente novamente.";
        toast.error(errorMessage);
        router.push("/painel/autor");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissao();
  }, [submissaoId, router]);

  const handleDelete = async () => {
    if (!submissao) return;
    
    if (!confirm("Tem certeza que deseja excluir esta submissão? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await submissaoService.delete(submissao.id);
      toast.success("Submissão excluída com sucesso");
      router.push("/painel/autor");
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        "Erro ao excluir submissão. Tente novamente.";
      toast.error(errorMessage);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!submissao) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Submissão não encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              A submissão que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => router.push("/painel/autor")}>
              Voltar para o Painel
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
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {submissao.titulo}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(submissao.status)}
                  {getFormatoBadge(submissao.formato)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {submissao.status === StatusSubmissao.RASCUNHO && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info("Funcionalidade de edição em desenvolvimento");
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {submissao.resumo}
              </p>
            </CardContent>
          </Card>

          {/* Palavras-chave */}
          {submissao.palavrasChave && submissao.palavrasChave.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Palavras-chave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {submissao.palavrasChave.map((palavra, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/20 transition-colors cursor-default"
                    >
                      {palavra}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Adicionais */}
          {(submissao.sessaoId || submissao.doiId) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Informações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submissao.sessaoId && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">ID da Sessão</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{submissao.sessaoId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(String(submissao.sessaoId))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {submissao.doiId && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">DOI ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{submissao.doiId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(String(submissao.doiId))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">ID da Submissão</p>
                    <p className="text-sm font-medium font-mono">{submissao.id}</p>
                  </div>
                </div>

                {submissao.trilhaTematicaNome && (
                  <div className="flex items-start gap-3">
                    <Layers className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Trilha Temática</p>
                      <p className="text-sm font-medium">{submissao.trilhaTematicaNome}</p>
                    </div>
                  </div>
                )}

                {submissao.autorNome && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Autor</p>
                      <p className="text-sm font-medium">{submissao.autorNome}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Versão</p>
                    <p className="text-sm font-medium">Versão {submissao.versao}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Data de Submissão</p>
                  <p className="text-sm font-medium">{formatDate(submissao.dataSubmissao)}</p>
                </div>
              </div>

              {submissao.dataUltimaModificacao && (
                <div className="flex items-start gap-3">
                  <Edit className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Última Modificação</p>
                    <p className="text-sm font-medium">{formatDate(submissao.dataUltimaModificacao)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status e Formato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status e Formato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Status Atual</p>
                <div className="flex justify-start">
                  {getStatusBadge(submissao.status)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Formato</p>
                <div className="flex justify-start">
                  {getFormatoBadge(submissao.formato)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

