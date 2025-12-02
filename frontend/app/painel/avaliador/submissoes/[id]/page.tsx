"use client"

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Download, ArrowLeft, FileText, Calendar, Tag, User, AlertCircle, Send, Clock, Eye, CheckCircle2 } from "lucide-react";
import { submissaoService } from "@/lib/services/submissao/SubmissaoService";
import { arquivoSubmissaoService } from "@/lib/services/submissao/ArquivoSubmissaoService";
import { avaliacaoService } from "@/lib/services/avaliacao/AvaliacaoService";
import { Submissao } from "@/types/submissao/Submissao";
import { ArquivoSubmissao } from "@/types/submissao/ArquivoSubmissao";
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao";
import { AvaliacaoRequest } from "@/types/avaliacao/AvaliacaoRequest";
import { Avaliacao } from "@/types/avaliacao/Avaliacao";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function SubmissaoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const submissaoId = Number(params.id);

  const [submissao, setSubmissao] = React.useState<Submissao | null>(null);
  const [arquivos, setArquivos] = React.useState<ArquivoSubmissao[]>([]);
  const [avaliacoes, setAvaliacoes] = React.useState<Avaliacao[]>([]);
  const [minhaAvaliacao, setMinhaAvaliacao] = React.useState<Avaliacao | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [downloadingPdf, setDownloadingPdf] = React.useState(false);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = React.useState(false);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = React.useState(false);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = React.useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = React.useState<Avaliacao | null>(null);
  const [notaGeral, setNotaGeral] = React.useState<number>(5);
  const [notaOriginalidade, setNotaOriginalidade] = React.useState<number>(5);
  const [notaMetodologia, setNotaMetodologia] = React.useState<number>(5);
  const [notaRelevancia, setNotaRelevancia] = React.useState<number>(5);
  const [notaRedacao, setNotaRedacao] = React.useState<number>(5);
  const [recomendacao, setRecomendacao] = React.useState<string>("");
  const [confidencial, setConfidencial] = React.useState<boolean>(false);

  const loadSubmissao = async () => {
    try {
      setLoading(true);
      const data = await submissaoService.getById(submissaoId);
      setSubmissao(data);

      // Busca os arquivos da submissão
      const files = await arquivoSubmissaoService.listarPorSubmissao(submissaoId);
      setArquivos(files);

      // Se houver arquivos, faz download do primeiro (ou do PDF)
      if (files.length > 0) {
        await downloadPdf(files[0].id);
      } else {
        setDownloadingPdf(false);
      }

      // Carrega as avaliações da submissão
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
      // Não exibir erro para o usuário aqui, apenas log
    }

    // Carrega a avaliação do avaliador logado separadamente
    try {
      const minhaAval = await avaliacaoService.getMinhaAvaliacaoPorSubmissao(submissaoId);
      setMinhaAvaliacao(minhaAval);
    } catch (error: any) {
      console.error("Erro ao carregar minha avaliação:", error);
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

  const submeterAvaliacao = async () => {
    if (!submissao) return;

    try {
      setEnviandoAvaliacao(true);

      const avaliacaoRequest: AvaliacaoRequest = {
        notaGeral,
        notaOriginalidade,
        notaMetodologia,
        notaRelevancia,
        notaRedacao,
        recomendacao,
        confidencial,
        submissaoId: submissao.id,
      };

      const avaliacaoCriada = await avaliacaoService.create(avaliacaoRequest);
      
      // Atualiza a avaliação do avaliador logado
      setMinhaAvaliacao(avaliacaoCriada);
      
      toast.success("Avaliação enviada com sucesso!");
      setNotaGeral(5);
      setNotaOriginalidade(5);
      setNotaMetodologia(5);
      setNotaRelevancia(5);
      setNotaRedacao(5);
      setRecomendacao("");
      setConfidencial(false);
      setModalAberto(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao enviar avaliação. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setEnviandoAvaliacao(false);
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal - PDF */}
        <div className="lg:col-span-2">
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

          {/* Avaliação abaixo do PDF */}
          {minhaAvaliacao ? (
            // Card mostrando avaliação já feita
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">Sua Avaliação Realizada</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Enviada em {formatDate(minhaAvaliacao.dataCriacao)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Notas Obtidas</h3>
                    <span className="text-xs font-medium text-muted-foreground">
                      Média: {((minhaAvaliacao.notaGeral! + minhaAvaliacao.notaOriginalidade! + minhaAvaliacao.notaMetodologia! + minhaAvaliacao.notaRelevancia!) / 4).toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nota Geral</p>
                        <span className="text-xs text-muted-foreground">{minhaAvaliacao.notaGeral?.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(minhaAvaliacao.notaGeral! / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Originalidade</p>
                        <span className="text-xs text-muted-foreground">{minhaAvaliacao.notaOriginalidade?.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(minhaAvaliacao.notaOriginalidade! / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Metodologia</p>
                        <span className="text-xs text-muted-foreground">{minhaAvaliacao.notaMetodologia?.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(minhaAvaliacao.notaMetodologia! / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relevância</p>
                        <span className="text-xs text-muted-foreground">{minhaAvaliacao.notaRelevancia?.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(minhaAvaliacao.notaRelevancia! / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {minhaAvaliacao.recomendacao && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      Recomendação
                    </h3>
                    <div className="p-4 rounded-lg border bg-secondary/30">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">{minhaAvaliacao.recomendacao}</p>
                    </div>
                  </div>
                )}

                {minhaAvaliacao.confidencial && (
                  <div className="border-t pt-6">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
                      <span className="text-base">🔒</span>
                      <div>
                        <p className="text-xs font-semibold text-warning">Avaliação Confidencial</p>
                        <p className="text-xs text-warning/80">Esta avaliação foi marcada como confidencial</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Card azul com botão para abrir formulário
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Sua Avaliação</CardTitle>
                <CardDescription>
                  Avalie esta submissão com critérios detalhados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setModalAberto(true)}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  Abrir Formulário de Avaliação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna lateral - Informações */}
        <div className="space-y-6">
          {/* Card de Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Submissão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Tag className="h-3 w-3" />
                  Formato
                </div>
                <div>
                  {getFormatoBadge(submissao.formato)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <User className="h-3 w-3" />
                  Autor
                </div>
                <div className="text-sm">
                  {submissao.autorNome || `ID: ${submissao.autorId}`}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Tag className="h-3 w-3" />
                  Trilha Temática
                </div>
                <div className="text-sm">
                  {submissao.trilhaTematicaNome || `ID: ${submissao.trilhaTematicaId}`}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  Submetida em
                </div>
                <div className="text-sm">
                  {formatDate(submissao.dataSubmissao)}
                </div>
              </div>

              {submissao.dataUltimaModificacao && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    Última modificação
                  </div>
                  <div className="text-sm">
                    {formatDate(submissao.dataUltimaModificacao)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {submissao.resumo}
              </p>
            </CardContent>
          </Card>

          {/* Card de Palavras-chave */}
          {submissao.palavrasChave && submissao.palavrasChave.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Palavras-chave</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Card de Arquivos */}
          {arquivos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Arquivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {arquivos.map((arquivo) => (
                  <Button
                    key={arquivo.id}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => downloadArquivo(arquivo.id, arquivo.nomeArquivo || `arquivo-${arquivo.id}`)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="truncate">
                      {arquivo.nomeArquivo || `Arquivo ${arquivo.id}`}
                    </span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Avaliação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Formulário de Avaliação</DialogTitle>
            <DialogDescription>
              Avalie a submissão "{submissao?.titulo}" com os critérios abaixo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Notas Específicas (0-10)</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="notaGeral">Nota Geral</Label>
                  <span className="text-xs font-medium text-muted-foreground">{notaGeral}</span>
                </div>
                <Input
                  id="notaGeral"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={notaGeral}
                  onChange={(e) => setNotaGeral(parseFloat(e.target.value))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="notaOriginalidade">Originalidade</Label>
                  <span className="text-xs font-medium text-muted-foreground">{notaOriginalidade}</span>
                </div>
                <Input
                  id="notaOriginalidade"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={notaOriginalidade}
                  onChange={(e) => setNotaOriginalidade(parseFloat(e.target.value))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="notaMetodologia">Metodologia</Label>
                  <span className="text-xs font-medium text-muted-foreground">{notaMetodologia}</span>
                </div>
                <Input
                  id="notaMetodologia"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={notaMetodologia}
                  onChange={(e) => setNotaMetodologia(parseFloat(e.target.value))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="notaRelevancia">Relevância</Label>
                  <span className="text-xs font-medium text-muted-foreground">{notaRelevancia}</span>
                </div>
                <Input
                  id="notaRelevancia"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={notaRelevancia}
                  onChange={(e) => setNotaRelevancia(parseFloat(e.target.value))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="notaRedacao">Redação</Label>
                  <span className="text-xs font-medium text-muted-foreground">{notaRedacao}</span>
                </div>
                <Input
                  id="notaRedacao"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={notaRedacao}
                  onChange={(e) => setNotaRedacao(parseFloat(e.target.value))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recomendacao">Recomendação</Label>
              <Textarea
                id="recomendacao"
                placeholder="Adicione sua recomendação sobre esta submissão..."
                value={recomendacao}
                onChange={(e) => setRecomendacao(e.target.value)}
                className="bg-white dark:bg-gray-800 min-h-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="confidencial"
                type="checkbox"
                checked={confidencial}
                onChange={(e) => setConfidencial(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
              />
              <Label htmlFor="confidencial" className="cursor-pointer font-normal">
                Marcar como confidencial
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalAberto(false)}
                disabled={enviandoAvaliacao}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={submeterAvaliacao}
                disabled={enviandoAvaliacao}
                className="flex-1 gap-2"
              >
                {enviandoAvaliacao ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Avaliação
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}