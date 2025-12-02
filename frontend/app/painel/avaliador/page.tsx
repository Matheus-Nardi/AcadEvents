"use client"

import React from "react"
import { Loader2, CheckCircle2, XCircle, FileText, Clock, Eye, AlertCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { avaliacaoService } from "@/lib/services/avaliacao/AvaliacaoService"
import { ConviteAvaliacao } from "@/types/avaliacao/ConviteAvaliacao"
import { Avaliacao } from "@/types/avaliacao/Avaliacao"
import { toast } from "sonner"

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default function AvaliadorPage() {
  const [convites, setConvites] = React.useState<ConviteAvaliacao[]>([])
  const [avaliacoes, setAvaliacoes] = React.useState<Avaliacao[]>([])
  const [loadingConvites, setLoadingConvites] = React.useState(true)
  const [loadingAvaliacoes, setLoadingAvaliacoes] = React.useState(true)
  const [processing, setProcessing] = React.useState<number | null>(null)
  const [dialogRecusarAberto, setDialogRecusarAberto] = React.useState(false)
  const [conviteRecusarId, setConviteRecusarId] = React.useState<number | null>(null)
  const [justificativa, setJustificativa] = React.useState("")
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = React.useState(false)
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = React.useState<Avaliacao | null>(null)

  const getApiMessage = (e: unknown, fallback: string) => {
    if (typeof e === "object" && e !== null) {
      const resp = (e as { response?: { data?: { message?: string } } }).response
      const msg = resp?.data?.message
      if (typeof msg === "string" && msg.length > 0) return msg
    }
    return fallback
  }

  const loadConvites = async () => {
    try {
      setLoadingConvites(true)
      const data = await avaliacaoService.getMeusConvites()
      setConvites(data)
    } catch (error: unknown) {
      const errorMessage = getApiMessage(error, "Erro ao carregar convites. Tente novamente.")
      toast.error(errorMessage)
    } finally {
      setLoadingConvites(false)
    }
  }

  const loadAvaliacoes = async () => {
    try {
      setLoadingAvaliacoes(true)
      const data = await avaliacaoService.getMinhasAvaliacoes()
      setAvaliacoes(data)
    } catch (error: unknown) {
      const errorMessage = getApiMessage(error, "Erro ao carregar avaliações. Tente novamente.")
      toast.error(errorMessage)
    } finally {
      setLoadingAvaliacoes(false)
    }
  }

  React.useEffect(() => {
    loadConvites()
    loadAvaliacoes()
  }, [])

  const aceitarConvite = async (id: number) => {
    try {
      setProcessing(id)
      await avaliacaoService.aceitarConvite(id)
      toast.success("Convite aceito com sucesso")
      await loadConvites()
      await loadAvaliacoes()
    } catch (error: unknown) {
      const errorMessage = getApiMessage(error, "Não foi possível aceitar o convite.")
      toast.error(errorMessage)
    } finally {
      setProcessing(null)
    }
  }

  const abrirDialogRecusar = (id: number) => {
    setConviteRecusarId(id)
    setJustificativa("")
    setDialogRecusarAberto(true)
  }

  const fecharDialogRecusar = () => {
    setDialogRecusarAberto(false)
    setConviteRecusarId(null)
    setJustificativa("")
  }

  const abrirModalAvaliacao = (avaliacao: Avaliacao) => {
    setAvaliacaoSelecionada(avaliacao)
    setModalAvaliacaoAberto(true)
  }

  const fecharModalAvaliacao = () => {
    setModalAvaliacaoAberto(false)
    setAvaliacaoSelecionada(null)
  }

  const recusarConvite = async () => {
    if (!conviteRecusarId) return
    if (justificativa.trim().length === 0) {
      toast.error("Por favor, informe o motivo da recusa.")
      return
    }
    try {
      setProcessing(conviteRecusarId)
      await avaliacaoService.recusarConvite(conviteRecusarId, { motivoRecusa: justificativa })
      toast.success("Convite recusado")
      await loadConvites()
      fecharDialogRecusar()
    } catch (error: unknown) {
      const errorMessage = getApiMessage(error, "Não foi possível recusar o convite.")
      toast.error(errorMessage)
    } finally {
      setProcessing(null)
    }
  }

  const pendentes = avaliacoes.filter(a => !a.notaGeral || a.notaGeral === 0)
  const concluidas = avaliacoes.filter(a => a.notaGeral && a.notaGeral > 0)

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Painel do Avaliador</h1>
        <p className="text-muted-foreground">Gerencie seus convites e avaliações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Convites de Avaliação</h2>
            {loadingConvites ? (
              <div className="flex items-center justify-center min-h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : convites.length === 0 ? (
              <Card>
                <CardContent className="py-8 flex flex-col items-center">
                  <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Nenhum convite pendente</h3>
                  <p className="text-sm text-muted-foreground">Você não possui convites no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {convites.map((convite) => (
                  <Card key={convite.id} className="hover:shadow-sm transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">Convite #{convite.id}</CardTitle>
                          <CardDescription>Submissão {convite.submissaoId} • Enviado em {formatDate(convite.dataConvite)}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => aceitarConvite(convite.id)}
                            disabled={processing === convite.id}
                          >
                            {processing === convite.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Aceitar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => abrirDialogRecusar(convite.id)}
                            disabled={processing === convite.id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Minhas Avaliações</h2>
            {loadingAvaliacoes ? (
              <div className="flex items-center justify-center min-h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : avaliacoes.length === 0 ? (
              <Card>
                <CardContent className="py-8 flex flex-col items-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Nenhuma avaliação atribuída</h3>
                  <p className="text-sm text-muted-foreground">Você ainda não possui avaliações</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {avaliacoes.map((av) => (
                  <Card key={av.id} className="hover:shadow-sm transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">Submissão {av.submissaoId}</CardTitle>
                      <CardDescription>
                        {av.notaGeral && av.notaGeral > 0 ? (
                          <>Nota {av.notaGeral} • Avaliado em {formatDate(av.dataCriacao)}</>
                        ) : (
                          <>Pendente de avaliação</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="border-t pt-4">
                      <Button
                        variant={av.notaGeral && av.notaGeral > 0 ? "outline" : "default"}
                        className="w-full"
                        onClick={() => abrirModalAvaliacao(av)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {av.notaGeral && av.notaGeral > 0 ? "Ver avaliação" : "Avaliar"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{convites.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Convites pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{pendentes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Avaliações pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{concluidas.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Avaliações concluídas</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogRecusarAberto} onOpenChange={setDialogRecusarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Convite</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da recusa do convite de avaliação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="justificativa" className="text-sm font-medium">
                Justificativa
              </label>
              <Textarea
                id="justificativa"
                placeholder="Descreva o motivo da recusa..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={fecharDialogRecusar}
              disabled={processing === conviteRecusarId}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={recusarConvite}
              disabled={processing === conviteRecusarId || justificativa.trim().length === 0}
            >
              {processing === conviteRecusarId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recusando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Recusar Convite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalAvaliacaoAberto} onOpenChange={setModalAvaliacaoAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Avaliação</DialogTitle>
            <DialogDescription>
              Submissão #{avaliacaoSelecionada?.submissaoId}
            </DialogDescription>
          </DialogHeader>

          {avaliacaoSelecionada && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {avaliacaoSelecionada.notaGeral && avaliacaoSelecionada.notaGeral > 0 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Concluída</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">Pendente</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Data</p>
                  <p className="text-sm">
                    {avaliacaoSelecionada.notaGeral && avaliacaoSelecionada.notaGeral > 0
                      ? formatDate(avaliacaoSelecionada.dataCriacao)
                      : "—"}
                  </p>
                </div>
              </div>

              {avaliacaoSelecionada.notaGeral && avaliacaoSelecionada.notaGeral > 0 && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Nota Geral
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Média de 4 critérios
                      </span>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <p className="text-4xl font-bold text-primary">{avaliacaoSelecionada.notaGeral.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground mt-2">de 10 pontos</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Notas por Critério</h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Originalidade</p>
                          <span className="text-sm font-semibold">{avaliacaoSelecionada.notaOriginalidade.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(avaliacaoSelecionada.notaOriginalidade / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Metodologia</p>
                          <span className="text-sm font-semibold">{avaliacaoSelecionada.notaMetodologia.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(avaliacaoSelecionada.notaMetodologia / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relevância</p>
                          <span className="text-sm font-semibold">{avaliacaoSelecionada.notaRelevancia.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(avaliacaoSelecionada.notaRelevancia / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Redação</p>
                          <span className="text-sm font-semibold">{avaliacaoSelecionada.notaRedacao.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(avaliacaoSelecionada.notaRedacao / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {avaliacaoSelecionada.recomendacao && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        Recomendação
                      </h3>
                      <div className="p-4 rounded-lg border bg-secondary/30">
                        <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                          {avaliacaoSelecionada.recomendacao}
                        </p>
                      </div>
                    </div>
                  )}

                  {avaliacaoSelecionada.confidencial && (
                    <div className="p-3 rounded-lg border border-warning/20 bg-warning/10">
                      <div className="flex items-start gap-2">
                        <span className="text-base mt-0.5">🔒</span>
                        <div>
                          <p className="text-xs font-semibold text-warning">Avaliação Confidencial</p>
                          <p className="text-xs text-warning/80 mt-0.5">Esta avaliação foi marcada como confidencial</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={fecharModalAvaliacao}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}