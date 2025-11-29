"use client"

import React from "react"
import { Loader2, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConviteAvaliacao } from "@/types/avaliacao/ConviteAvaliacao"
import { avaliacaoService } from "@/lib/services/avaliacao/AvaliacaoService"

function formatDate(dateString: string | undefined | null) {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default function ConvitesHistoricoPage() {
  const [convites, setConvites] = React.useState<ConviteAvaliacao[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<"Todos" | "Pendentes" | "Aceitos" | "Recusados">("Todos")

  const mapFilterToStatus = (filterValue: string): string => {
    const statusMap: Record<string, string> = {
      "all": "Todos",
      "Todos": "Todos",
      "pendentes": "Pendentes",
      "Pendentes": "Pendentes",
      "aceitos": "Aceitos",
      "Aceitos": "Aceitos",
      "recusados": "Recusados",
      "Recusados": "Recusados"
    }
    return statusMap[filterValue] || "Todos"
  }

  const load = async () => {
    try {
      setLoading(true)
      const statusParam = mapFilterToStatus(filter)
      const data = await avaliacaoService.getMeusConvitesComFiltro(statusParam)
      setConvites(data)
    } catch (error) {
      console.error("Erro ao carregar histórico de convites:", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [filter])

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Histórico de Convites</h1>
        <p className="text-sm text-muted-foreground">Lista de todos os convites que você recebeu.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant={filter === "Todos" ? "default" : "outline"} onClick={() => setFilter("Todos")}>Todos</Button>
        <Button variant={filter === "Pendentes" ? "default" : "outline"} onClick={() => setFilter("Pendentes")}>Pendentes</Button>
        <Button variant={filter === "Aceitos" ? "default" : "outline"} onClick={() => setFilter("Aceitos")}>Aceitos</Button>
        <Button variant={filter === "Recusados" ? "default" : "outline"} onClick={() => setFilter("Recusados")}>Recusados</Button>
        <Button variant="ghost" onClick={load}>Atualizar</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : convites.length === 0 ? (
        <Card>
          <CardContent className="py-8 flex flex-col items-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">Nenhum convite encontrado</h3>
            <p className="text-sm text-muted-foreground">Altere o filtro ou tente novamente mais tarde.</p>
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
                    <CardDescription>
                      Submissão {convite.submissaoId} • Enviado em {formatDate(convite.dataConvite)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {convite.aceito === true ? (
                        <span className="inline-flex items-center text-green-600"><CheckCircle2 className="mr-1 h-4 w-4"/> Aceito</span>
                      ) : convite.aceito === false ? (
                        <span className="inline-flex items-center text-red-600"><XCircle className="mr-1 h-4 w-4"/> Recusado</span>
                      ) : (
                        <span className="inline-flex items-center text-muted-foreground">Pendente</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {convite.aceito !== true && (
                    <div>
                      <div className="text-xs text-muted-foreground">Motivo de Recusa</div>
                      <div>{convite.motivoRecusa ?? "-"}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
