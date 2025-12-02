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
  ExternalLink,
  BookMarked,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageCircle,
} from "lucide-react";
import { submissaoService } from "@/lib/services/submissao/SubmissaoService";
import { referenciaService } from "@/lib/services/referencia/ReferenciaService";
import { arquivoSubmissaoService } from "@/lib/services/submissao/ArquivoSubmissaoService";
import { avaliacaoService } from "@/lib/services/avaliacao/AvaliacaoService";
import { Submissao } from "@/types/submissao/Submissao";
import { Referencia } from "@/types/referencia/Referencia";
import { ArquivoSubmissao } from "@/types/submissao/ArquivoSubmissao";
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao";
import { Avaliacao } from "@/types/avaliacao/Avaliacao";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
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
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// Configurar worker do pdfjs
if (typeof window !== "undefined") {
  // Usar worker do pdfjs-dist através do CDN jsDelivr (mais confiável)
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

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
  const [referencias, setReferencias] = React.useState<Referencia[]>([]);
  const [arquivoSubmissao, setArquivoSubmissao] = React.useState<ArquivoSubmissao | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [scale, setScale] = React.useState(1.0);
  const [loading, setLoading] = React.useState(true);
  const [loadingReferencias, setLoadingReferencias] = React.useState(false);
  const [loadingArquivo, setLoadingArquivo] = React.useState(false);
  const [avaliacoes, setAvaliacoes] = React.useState<Avaliacao[]>([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = React.useState(false);
  const [downloadingPdf, setDownloadingPdf] = React.useState(false);
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

        // Buscar referências da submissão
        try {
          setLoadingReferencias(true);
          const refs = await referenciaService.getBySubmissao(submissaoId);
          setReferencias(refs);
        } catch (refError: any) {
          console.error("Erro ao buscar referências:", refError);
          // Não bloqueia a exibição da submissão se houver erro ao buscar referências
          setReferencias([]);
        } finally {
          setLoadingReferencias(false);
        }

        // Buscar arquivo da submissão
        try {
          setLoadingArquivo(true);
          const arquivos = await arquivoSubmissaoService.listarPorSubmissao(submissaoId);
          if (arquivos && arquivos.length > 0) {
            // Pegar o arquivo mais recente (maior versão ou mais recente)
            const arquivoMaisRecente = arquivos.reduce((prev, current) => {
              if (prev.versao > current.versao) return prev;
              if (prev.versao < current.versao) return current;
              // Se versões iguais, pegar o mais recente pela data
              return new Date(prev.dataUpload) > new Date(current.dataUpload) ? prev : current;
            });
            setArquivoSubmissao(arquivoMaisRecente);

            // Fazer download do arquivo e criar blob URL
            const blob = await arquivoSubmissaoService.downloadArquivo(arquivoMaisRecente.id);
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
          }
        } catch (arquivoError: any) {
          console.error("Erro ao buscar arquivo:", arquivoError);
          // Não bloqueia a exibição da submissão se houver erro ao buscar arquivo
        } finally {
          setLoadingArquivo(false);
        }
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

  // Buscar avaliações da submissão para visualização do autor
  React.useEffect(() => {
    const fetchAvaliacoes = async () => {
      if (!submissaoId || isNaN(submissaoId)) {
        return;
      }

      try {
        setLoadingAvaliacoes(true);
        const data = await avaliacaoService.getAvaliacoesPorSubmissao(submissaoId);
        setAvaliacoes(data);
      } catch (error: any) {
        console.error("Erro ao buscar avaliações da submissão:", error);
        toast.error("Erro ao carregar avaliações da submissão.");
      } finally {
        setLoadingAvaliacoes(false);
      }
    };

    fetchAvaliacoes();
  }, [submissaoId]);

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

  // Limpar blob URL ao desmontar
  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

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


  const downloadArquivo = async () => {
    if (!arquivoSubmissao) return;
    try {
      const blob = await arquivoSubmissaoService.downloadArquivo(arquivoSubmissao.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = arquivoSubmissao.nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download iniciado");
    } catch (error: any) {
      toast.error("Erro ao fazer download do arquivo");
    }
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

                        {referencia.abstract && (
                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground mb-1">Resumo</p>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {referencia.abstract}
                            </p>
                          </div>
                        )}

                        {(referencia.tipoPublicacao || referencia.publisher) && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            {referencia.tipoPublicacao && (
                              <span className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground px-2 py-1 text-xs">
                                {referencia.tipoPublicacao}
                              </span>
                            )}
                            {referencia.publisher && (
                              <span className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground px-2 py-1 text-xs">
                                {referencia.publisher}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avaliações da Submissão (visão do autor) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Avaliações da Submissão
                {loadingAvaliacoes && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>
                {avaliacoes.length > 0
                  ? `${avaliacoes.length} avaliação${avaliacoes.length > 1 ? "es" : ""} recebida${avaliacoes.length > 1 ? "s" : ""}`
                  : "Nenhuma avaliação recebida até o momento"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAvaliacoes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : avaliacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Sua submissão ainda não recebeu avaliações.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {avaliacoes.map((avaliacao) => (
                    <div
                      key={avaliacao.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold">
                              Nota geral: {avaliacao.notaGeral.toFixed(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <span>Originalidade: <strong>{avaliacao.notaOriginalidade.toFixed(1)}</strong></span>
                            <span>Metodologia: <strong>{avaliacao.notaMetodologia.toFixed(1)}</strong></span>
                            <span>Relevância: <strong>{avaliacao.notaRelevancia.toFixed(1)}</strong></span>
                            <span>Redação: <strong>{avaliacao.notaRedacao.toFixed(1)}</strong></span>
                          </div>
                          {avaliacao.recomendacao && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <MessageCircle className="h-4 w-4 mt-0.5" />
                              <p className="leading-relaxed whitespace-pre-wrap">
                                {avaliacao.recomendacao}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground text-right min-w-[120px]">
                          {formatDateShort(avaliacao.dataCriacao)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

