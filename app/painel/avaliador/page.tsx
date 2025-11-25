"use client"

import React from "react"
import { Loader2, CheckCircle2, XCircle, FileText, Clock } from "lucide-react"
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

  const pendentes = avaliacoes.filter(a => !a.nota || a.nota === 0)
  const concluidas = avaliacoes.filter(a => a.nota && a.nota > 0)

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
              <div className="flex items-center justify-center min-h-[160px]">
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
              <div className="flex items-center justify-center min-h-[160px]">
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
                        {av.nota && av.nota > 0 ? (
                          <>Nota {av.nota} • Avaliado em {formatDate(av.dataAvaliacao)}</>
                        ) : (
                          <>Pendente de avaliação</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="border-t pt-4">
                      <Button
                        variant={av.nota && av.nota > 0 ? "outline" : "default"}
                        className="w-full"
                        onClick={() => {}}
                      >
                        {av.nota && av.nota > 0 ? "Ver avaliação" : "Avaliar"}
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
    </div>
  )
}