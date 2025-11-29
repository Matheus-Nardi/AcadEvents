"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stepper } from "@/components/ui/stepper"
import { EtapaInformacoesBasicas, InformacoesBasicasFormValues } from "@/components/project/forms/submissao/EtapaInformacoesBasicas"
import { EtapaReferencias } from "@/components/project/forms/submissao/EtapaReferencias"
import { EtapaUploadArquivo } from "@/components/project/forms/submissao/EtapaUploadArquivo"
import { submissaoService } from "@/lib/services/submissao/SubmissaoService"
import { SubmissaoRequest } from "@/types/submissao/SubmissaoRequest"
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

const STEPS = [
  { label: "Informações Básicas", description: "Título, resumo e formato" },
  { label: "Referências", description: "Adicione referências por DOI" },
  { label: "Arquivo", description: "Envie o arquivo da submissão" },
]

export default function SubmissaoPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  
  const eventoId = Number(params.id)
  const trilhaTematicaId = Number(params.tematicaId)
  
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Objeto em construção - montado progressivamente
  const [informacoesBasicas, setInformacoesBasicas] = React.useState<InformacoesBasicasFormValues | null>(null)
  const [dois, setDois] = React.useState<string[]>([])
  const [arquivo, setArquivo] = React.useState<File | null>(null)

  React.useEffect(() => {
    if (!eventoId || !trilhaTematicaId || isNaN(eventoId) || isNaN(trilhaTematicaId)) {
      toast.error("Parâmetros inválidos")
      router.push("/eventos")
    }
  }, [eventoId, trilhaTematicaId, router])

  const handleInformacoesBasicasSubmit = async (data: InformacoesBasicasFormValues) => {
    setInformacoesBasicas(data)
    toast.success("Informações básicas salvas!")
    setCurrentStep(2)
  }

  const handleReferenciasNext = (doisList: string[]) => {
    setDois(doisList)
    setCurrentStep(3)
  }

  const handleReferenciasBack = () => {
    setCurrentStep(1)
  }

  const handleUploadBack = () => {
    setCurrentStep(2)
  }

  const handleComplete = async (arquivoSelecionado: File) => {
    if (!informacoesBasicas) {
      toast.error("Erro: Informações básicas não encontradas")
      return
    }

    if (!arquivoSelecionado) {
      toast.error("É necessário selecionar um arquivo para finalizar a submissão")
      return
    }

    try {
      setIsLoading(true)

      // Prepara a requisição completa
      // palavrasChave já é um array no schema
      const palavrasChaveArray = informacoesBasicas.palavrasChave

      const request: SubmissaoRequest = {
        titulo: informacoesBasicas.titulo,
        resumo: informacoesBasicas.resumo,
        palavrasChave: palavrasChaveArray,
        dataSubmissao: new Date().toISOString(),
        dataUltimaModificacao: new Date().toISOString(),
        versao: 1,
        status: StatusSubmissao.SUBMETIDA,
        formato: informacoesBasicas.formato,
        eventoId: eventoId,
        trilhaTematicaId: trilhaTematicaId,
      }

      // Cria a submissão completa de uma vez
      const resultado = await submissaoService.createComplete(
        request,
        arquivoSelecionado,
        dois.length > 0 ? dois : undefined
      )

      if (resultado.temErrosParciais) {
        toast.warning(
          `Submissão criada com sucesso! ${resultado.referenciasCriadas} referência(s) adicionada(s), mas ${resultado.errosReferencias.length} falharam.`,
          { duration: 5000 }
        )
        if (resultado.errosReferencias.length > 0) {
          console.warn("Erros nas referências:", resultado.errosReferencias)
        }
      } else {
        toast.success("Submissão realizada com sucesso!")
      }
      
      // Redireciona para a tela da submissão criada
      router.push(`/painel/autor/submissao/${resultado.submissao.id}`)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao finalizar submissão."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!eventoId || !trilhaTematicaId || isNaN(eventoId) || isNaN(trilhaTematicaId)) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
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
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Nova Submissão
        </h1>
        <p className="text-muted-foreground">
          Preencha as informações abaixo para submeter seu trabalho
        </p>
      </div>

      {/* Stepper */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Indicador de Progresso */}
      {informacoesBasicas && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">
                Progresso salvo localmente. Você pode navegar entre as etapas.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].label}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <EtapaInformacoesBasicas
              onSubmit={handleInformacoesBasicasSubmit}
              defaultValues={informacoesBasicas || undefined}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && informacoesBasicas && (
            <EtapaReferencias
              dois={dois}
              onDoisChange={setDois}
              onNext={handleReferenciasNext}
              onBack={handleReferenciasBack}
            />
          )}

          {currentStep === 3 && informacoesBasicas && (
            <EtapaUploadArquivo
              arquivo={arquivo}
              onArquivoChange={setArquivo}
              onBack={handleUploadBack}
              onComplete={handleComplete}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

