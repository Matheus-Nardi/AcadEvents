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
import { referenciaService } from "@/lib/services/referencia/ReferenciaService"
import { arquivoSubmissaoService } from "@/lib/services/submissao/ArquivoSubmissaoService"
import { SubmissaoRequest } from "@/types/submissao/SubmissaoRequest"
import { StatusSubmissao } from "@/types/submissao/StatusSubmissao"
import { Referencia } from "@/types/referencia/Referencia"
import { ArquivoSubmissao } from "@/types/submissao/ArquivoSubmissao"
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
  const [submissaoId, setSubmissaoId] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [informacoesBasicas, setInformacoesBasicas] = React.useState<InformacoesBasicasFormValues | null>(null)
  const [referencias, setReferencias] = React.useState<Referencia[]>([])
  const [arquivos, setArquivos] = React.useState<ArquivoSubmissao[]>([])

  React.useEffect(() => {
    if (!eventoId || !trilhaTematicaId || isNaN(eventoId) || isNaN(trilhaTematicaId)) {
      toast.error("Parâmetros inválidos")
      router.push("/eventos")
    }
  }, [eventoId, trilhaTematicaId, router])

  const handleInformacoesBasicasSubmit = async (data: InformacoesBasicasFormValues) => {
    try {
      setIsLoading(true)

      // Prepara a requisição
      const palavrasChaveArray = data.palavrasChave
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      const request: SubmissaoRequest = {
        titulo: data.titulo,
        resumo: data.resumo,
        palavrasChave: palavrasChaveArray,
        dataSubmissao: new Date().toISOString(),
        dataUltimaModificacao: new Date().toISOString(),
        versao: 1,
        status: StatusSubmissao.RASCUNHO,
        formato: data.formato,
        eventoId: eventoId,
        trilhaTematicaId: trilhaTematicaId,
      }

      // Cria a submissão
      const submissao = await submissaoService.create(request)
      setSubmissaoId(submissao.id)
      setInformacoesBasicas(data)
      
      toast.success("Informações básicas salvas com sucesso!")
      setCurrentStep(2)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao salvar informações básicas."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReferenciasNext = () => {
    if (submissaoId) {
      setCurrentStep(3)
    } else {
      toast.error("Erro: Submissão não encontrada")
    }
  }

  const handleReferenciasBack = () => {
    setCurrentStep(1)
  }

  const handleUploadBack = () => {
    setCurrentStep(2)
  }

  const handleComplete = async () => {
    if (!submissaoId) {
      toast.error("Erro: Submissão não encontrada")
      return
    }

    try {
      setIsLoading(true)

      // Atualiza o status da submissão para SUBMETIDA
      const palavrasChaveArray = informacoesBasicas!.palavrasChave
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      const updateRequest: SubmissaoRequest = {
        titulo: informacoesBasicas!.titulo,
        resumo: informacoesBasicas!.resumo,
        palavrasChave: palavrasChaveArray,
        dataSubmissao: new Date().toISOString(),
        dataUltimaModificacao: new Date().toISOString(),
        versao: 1,
        status: StatusSubmissao.SUBMETIDA,
        formato: informacoesBasicas!.formato,
        eventoId: eventoId,
        trilhaTematicaId: trilhaTematicaId,
      }

      await submissaoService.update(submissaoId, updateRequest)
      
      toast.success("Submissão realizada com sucesso!")
      router.push(`/eventos/${eventoId}`)
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

          {currentStep === 2 && submissaoId && (
            <EtapaReferencias
              submissaoId={submissaoId}
              referencias={referencias}
              onReferenciasChange={setReferencias}
              onNext={handleReferenciasNext}
              onBack={handleReferenciasBack}
            />
          )}

          {currentStep === 3 && submissaoId && (
            <EtapaUploadArquivo
              submissaoId={submissaoId}
              arquivos={arquivos}
              onArquivosChange={setArquivos}
              onBack={handleUploadBack}
              onComplete={handleComplete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

