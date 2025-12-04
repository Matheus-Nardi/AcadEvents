"use client"

import React from "react"
import Link from "next/link"
import { History, FileText, Calendar, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Submissao } from "@/types/submissao/Submissao"
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao"
import { submissaoService } from "@/lib/services/submissao/SubmissaoService"

interface HistoricoVersoesProps {
  submissaoId: number
  currentVersao: number
  isAutor?: boolean
}

const getStatusBadge = (status: StatusSubmissao) => {
  const statusConfig: Record<StatusSubmissao, { label: string; className: string }> = {
    [StatusSubmissao.SUBMETIDA]: {
      label: "Submetida",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    [StatusSubmissao.EM_AVALIACAO]: {
      label: "Em Avaliação",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    [StatusSubmissao.APROVADA]: {
      label: "Aprovada",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    [StatusSubmissao.APROVADA_COM_RESSALVAS]: {
      label: "Aprovada com Ressalvas",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    [StatusSubmissao.REJEITADA]: {
      label: "Rejeitada",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    [StatusSubmissao.EM_REVISÃO]: {
      label: "Em Revisão",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
  }

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function HistoricoVersoes({ submissaoId, currentVersao, isAutor = false }: HistoricoVersoesProps) {
  const [versoes, setVersoes] = React.useState<Submissao[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadVersoes = async () => {
      try {
        setLoading(true)
        const data = await submissaoService.getVersoes(submissaoId)
        setVersoes(data)
      } catch (error) {
        console.error("Erro ao carregar histórico de versões:", error)
      } finally {
        setLoading(false)
      }
    }

    loadVersoes()
  }, [submissaoId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Versões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (versoes.length <= 1) {
    return null // Não mostrar se só há uma versão
  }

  const basePath = isAutor 
    ? "/painel/autor/submissao" 
    : "/painel/avaliador/submissoes"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Versões
        </CardTitle>
        <CardDescription>
          Todas as versões desta submissão ({versoes.length} versão{versoes.length > 1 ? "ões" : ""})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versoes.map((versao) => {
            const isCurrent = versao.id === submissaoId
            
            return (
              <Link
                key={versao.id}
                href={`${basePath}/${versao.id}`}
                className={`block p-3 rounded-lg border transition-colors ${
                  isCurrent
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    : "hover:bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h4 className={`text-sm font-medium truncate ${
                        isCurrent ? "text-primary" : "text-foreground"
                      }`}>
                        {versao.titulo}
                      </h4>
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium shrink-0">
                          Versão Atual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                      <span>Versão {versao.versao}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(versao.dataSubmissao)}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(versao.status)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
