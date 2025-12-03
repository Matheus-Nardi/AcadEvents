"use client"

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Download, ArrowLeft, FileText, Calendar, Tag, User, AlertCircle, CheckCircle2, BookMarked, BookOpen, ExternalLink, Copy, Hash, Link as LinkIcon, Layers, Edit, AlertTriangle, XCircle, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { submissaoService } from "@/lib/services/submissao/SubmissaoService";
import { arquivoSubmissaoService } from "@/lib/services/submissao/ArquivoSubmissaoService";
import { avaliacaoService } from "@/lib/services/avaliacao/AvaliacaoService";
import { Submissao } from "@/types/submissao/Submissao";
import { ArquivoSubmissao } from "@/types/submissao/ArquivoSubmissao";
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao";
import { Avaliacao } from "@/types/avaliacao/Avaliacao";
import { DecidirStatusRevisaoRequest } from "@/types/submissao/DecidirStatusRevisaoRequest";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Referencia } from "@/types/referencia/Referencia";
import { referenciaService } from "@/lib/services/referencia/ReferenciaService";
import { RecomendacaoAvaliacao } from "@/types/avaliacao/RecomendacaoAvaliacao";

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

const getStatusBadge = (status: StatusSubmissao) => {
  const statusConfig: Record<StatusSubmissao, { label: string; className: string; icon: React.ReactNode }> = {
    [StatusSubmissao.SUBMETIDA]: {
      label: "Submetida",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: <FileText className="h-3 w-3" />
    },
    [StatusSubmissao.EM_AVALIACAO]: {
      label: "Em Avaliação",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <AlertCircle className="h-3 w-3" />
    },
    [StatusSubmissao.APROVADA]: {
      label: "Aprovada",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <FileText className="h-3 w-3" />
    },
    [StatusSubmissao.APROVADA_COM_RESSALVAS]: {
      label: "Aprovada com Ressalvas",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      icon: <AlertCircle className="h-3 w-3" />
    },
    [StatusSubmissao.REJEITADA]: {
      label: "Rejeitada",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <FileText className="h-3 w-3" />
    },
    [StatusSubmissao.EM_REVISÃO]: {
      label: "Em Revisão",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
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

const getRecomendacaoBadge = (recomendacao: RecomendacaoAvaliacao) => {
  const recomendacaoConfig: Record<RecomendacaoAvaliacao, { label: string; className: string }> = {
    [RecomendacaoAvaliacao.APROVAR]: {
      label: "Aprovar",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    [RecomendacaoAvaliacao.REJEITAR]: {
      label: "Rejeitar",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    [RecomendacaoAvaliacao.APROVAR_COM_RESSALVAS]: {
      label: "Aprovar com Ressalvas",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
  };

  const config = recomendacaoConfig[recomendacao] || {
    label: recomendacao,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function SubmissaoRevisaoPage() {
  const params = useParams();
  const router = useRouter();
  const submissaoId = Number(params.id);

  const [submissao, setSubmissao] = React.useState<Submissao | null>(null);
  const [arquivos, setArquivos] = React.useState<ArquivoSubmissao[]>([]);
  const [avaliacoes, setAvaliacoes] = React.useState<Avaliacao[]>([]);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [downloadingPdf, setDownloadingPdf] = React.useState(false);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = React.useState(false);
  const [decidindoStatus, setDecidindoStatus] = React.useState(false);
  const [referencias, setReferencias] = React.useState<Referencia[]>([]);
  const [loadingReferencias, setLoadingReferencias] = React.useState(false);
  const [dialogConfirmacaoAberto, setDialogConfirmacaoAberto] = React.useState(false);
  const [statusSelecionado, setStatusSelecionado] = React.useState<StatusSubmissao.APROVADA | StatusSubmissao.REJEITADA | null>(null);
  const [dialogSucessoAberto, setDialogSucessoAberto] = React.useState(false);
  const [mostrarAlerta, setMostrarAlerta] = React.useState(true);

  const loadSubmissao = async () => {
    try {
      setLoading(true);
      const data = await submissaoService.getById(submissaoId);
      setSubmissao(data);

      // Validar que o status é EM_REVISÃO
      if (data.status !== StatusSubmissao.EM_REVISÃO) {
        toast.error("Esta submissão não está em revisão. Você não pode tomar uma decisão final.");
        router.back();
        return;
      }

      try {
        setLoadingReferencias(true);
        const refs = await referenciaService.getBySubmissao(submissaoId);
        setReferencias(refs);
      } catch (refError: any) {
        console.error("Erro ao buscar referências:", refError);
        setReferencias([]);
      } finally {
        setLoadingReferencias(false);
      }

      // Busca os arquivos da submissão
      const files = await arquivoSubmissaoService.listarPorSubmissao(submissaoId);
      setArquivos(files);

      // Se houver arquivos, faz download do primeiro (ou do PDF)
      if (files.length > 0) {
        await downloadPdf(files[0].id);
      } else {
        setDownloadingPdf(false);
      }

      // Carrega todas as avaliações da submissão
      await loadAvaliacoes();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao carregar submissão. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadAvaliacoes = async () => {
    try {
      setLoadingAvaliacoes(true);
      const data = await avaliacaoService.getAvaliacoesPorSubmissao(submissaoId);
      setAvaliacoes(data);
    } catch (error: any) {
      console.error("Erro ao carregar avaliações:", error);
      toast.error("Erro ao carregar avaliações da submissão");
    } finally {
      setLoadingAvaliacoes(false);
    }
  };

  const downloadPdf = async (arquivoId: number) => {
    try {
      setDownloadingPdf(true);
      const blob = await arquivoSubmissaoService.downloadArquivo(arquivoId);
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao carregar PDF. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadArquivo = async (arquivoId: number, nomeArquivo: string) => {
    try {
      const blob = await arquivoSubmissaoService.downloadArquivo(arquivoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao fazer download do arquivo.";
      toast.error(errorMessage);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  const handleAbrirDialogConfirmacao = (status: StatusSubmissao.APROVADA | StatusSubmissao.REJEITADA) => {
    setStatusSelecionado(status);
    setDialogConfirmacaoAberto(true);
  };

  const handleConfirmarDecisao = async () => {
    if (!submissao || !statusSelecionado) return;

    try {
      setDecidindoStatus(true);
      setDialogConfirmacaoAberto(false);

      const request: DecidirStatusRevisaoRequest = {
        status: statusSelecionado,
      };

      await submissaoService.decidirStatusRevisao(submissaoId, request);
      
      // Ocultar o alerta e mostrar dialog de sucesso
      setMostrarAlerta(false);
      setDecidindoStatus(false);
      setDialogSucessoAberto(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao tomar decisão. Tente novamente.";
      toast.error(errorMessage);
      setDecidindoStatus(false);
    }
  };

  const handleFecharDialogSucesso = () => {
    setDialogSucessoAberto(false);
    router.back();
  };

  React.useEffect(() => {
    loadSubmissao();
  }, [submissaoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submissao) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
          <CardContent className="py-8 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Submissão não encontrada
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Não foi possível carregar os dados da submissão solicitada.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header com botão voltar */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{submissao.titulo}</h1>
            <p className="text-muted-foreground mt-1">
              Submissão #{submissao.id}
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(submissao.status)}
        </div>
      </div>

      {/* Alerta de Revisão */}
      <Card className="mb-6 border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                Decisão Final Necessária
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Esta submissão está com status <strong>EM_REVISÃO</strong> devido a um empate nas avaliações.
                Como organizador do evento, sua decisão final é essencial para o andamento do processo.
                Revise todas as informações e avaliações abaixo antes de tomar sua decisão.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

          {/* Visualização do Documento */}
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Documento</CardTitle>
              <CardDescription>
                {downloadingPdf ? "Carregando PDF..." : pdfUrl ? "PDF carregado com sucesso" : "Nenhum PDF disponível"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {downloadingPdf ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pdfUrl ? (
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ height: "800px" }}>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full rounded-lg"
                    title="PDF Viewer"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum PDF disponível para visualização
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5" />
                Referências
                {loadingReferencias && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>
                {referencias.length > 0
                  ? `${referencias.length} referência${referencias.length > 1 ? 's' : ''} encontrada${referencias.length > 1 ? 's' : ''}`
                  : "Nenhuma referência cadastrada para esta submissão"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReferencias ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : referencias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookMarked className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma referência foi adicionada a esta submissão.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referencias.map((referencia) => (
                    <div
                      key={referencia.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-base leading-tight">
                            {referencia.titulo}
                          </h4>
                          {referencia.doiValido && (
                            <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 text-xs font-medium shrink-0">
                              DOI Válido
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {referencia.autores && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span>{referencia.autores}</span>
                            </div>
                          )}
                          {referencia.ano && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{referencia.ano}</span>
                            </div>
                          )}
                          {referencia.publicacao && (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span className="line-clamp-1">{referencia.publicacao}</span>
                            </div>
                          )}
                        </div>

                        {referencia.doiCodigo && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">DOI</p>
                              <div className="flex items-center gap-2">
                                <a
                                  href={referencia.doiUrl || `https://doi.org/${referencia.doiCodigo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-mono text-primary hover:underline break-all"
                                >
                                  {referencia.doiCodigo}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => copyToClipboard(referencia.doiCodigo || "")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Todas as Avaliações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Todas as Avaliações
                {loadingAvaliacoes && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>
                {avaliacoes.length > 0
                  ? `${avaliacoes.length} avaliação${avaliacoes.length > 1 ? 'ões' : ''} realizada${avaliacoes.length > 1 ? 's' : ''}`
                  : "Nenhuma avaliação realizada ainda"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAvaliacoes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : avaliacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma avaliação foi realizada ainda para esta submissão.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {avaliacoes.map((avaliacao, index) => (
                    <div
                      key={avaliacao.id}
                      className="p-4 rounded-lg border bg-card space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-base">
                              Avaliação #{index + 1}
                            </h4>
                            {avaliacao.confidencial && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 text-xs font-medium">
                                🔒 Confidencial
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Realizada em {formatDate(avaliacao.dataCriacao)}
                          </p>
                        </div>
                        {avaliacao.recomendacaoEnum && (
                          <div>
                            {getRecomendacaoBadge(avaliacao.recomendacaoEnum)}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nota Geral</p>
                            <span className="text-xs text-muted-foreground">{avaliacao.notaGeral?.toFixed(1)}/10</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${((avaliacao.notaGeral || 0) / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Originalidade</p>
                            <span className="text-xs text-muted-foreground">{avaliacao.notaOriginalidade?.toFixed(1)}/10</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${((avaliacao.notaOriginalidade || 0) / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Metodologia</p>
                            <span className="text-xs text-muted-foreground">{avaliacao.notaMetodologia?.toFixed(1)}/10</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${((avaliacao.notaMetodologia || 0) / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relevância</p>
                            <span className="text-xs text-muted-foreground">{avaliacao.notaRelevancia?.toFixed(1)}/10</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${((avaliacao.notaRelevancia || 0) / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {avaliacao.recomendacao && (
                        <div className="pt-2 border-t">
                          <h5 className="text-sm font-semibold mb-2">Recomendação e Comentários</h5>
                          <div className="p-4 rounded-lg border bg-secondary/30">
                            <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                              {avaliacao.recomendacao}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decisão Final */}
          <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5" />
                Decisão Final
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-400">
                Após revisar todas as informações e avaliações acima, tome sua decisão final sobre esta submissão.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                onClick={() => handleAbrirDialogConfirmacao(StatusSubmissao.APROVADA)}
                disabled={decidindoStatus}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                size="lg"
              >
                <ThumbsUp className="h-5 w-5" />
                Aprovar Submissão
              </Button>
              <Button
                onClick={() => handleAbrirDialogConfirmacao(StatusSubmissao.REJEITADA)}
                disabled={decidindoStatus}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                size="lg"
                variant="destructive"
              >
                <ThumbsDown className="h-5 w-5" />
                Rejeitar Submissão
              </Button>
            </CardContent>
          </Card>
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

                {submissao.versao && (
                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Versão</p>
                      <p className="text-sm font-medium">Versão {submissao.versao}</p>
                    </div>
                  </div>
                )}
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

      {/* Dialog de Confirmação */}
      <Dialog open={dialogConfirmacaoAberto} onOpenChange={setDialogConfirmacaoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statusSelecionado === StatusSubmissao.APROVADA ? (
                <ThumbsUp className="h-5 w-5 text-green-600" />
              ) : (
                <ThumbsDown className="h-5 w-5 text-red-600" />
              )}
              Confirmar Decisão
            </DialogTitle>
            <DialogDescription>
              {statusSelecionado === StatusSubmissao.APROVADA
                ? "Tem certeza que deseja APROVAR esta submissão? Esta ação é irreversível."
                : "Tem certeza que deseja REJEITAR esta submissão? Esta ação é irreversível."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogConfirmacaoAberto(false)}
              disabled={decidindoStatus}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarDecisao}
              disabled={decidindoStatus}
              className={
                statusSelecionado === StatusSubmissao.APROVADA
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {decidindoStatus ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  {statusSelecionado === StatusSubmissao.APROVADA ? (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Confirmar Aprovação
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Confirmar Rejeição
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Sucesso */}
      <Dialog open={dialogSucessoAberto} onOpenChange={handleFecharDialogSucesso}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Decisão Registrada
            </DialogTitle>
            <DialogDescription>
              {statusSelecionado === StatusSubmissao.APROVADA
                ? "A submissão foi aprovada com sucesso!"
                : "A submissão foi rejeitada com sucesso!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleFecharDialogSucesso}>
              Voltar para Comitê
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

