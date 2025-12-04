"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stepper } from "@/components/ui/stepper"
import { EtapaInformacoesBasicas, InformacoesBasicasFormValues } from "@/components/project/forms/submissao/EtapaInformacoesBasicas"
import { EtapaReferencias } from "@/components/project/forms/submissao/EtapaReferencias"
import { EtapaUploadArquivo } from "@/components/project/forms/submissao/EtapaUploadArquivo"
import { submissaoService } from "@/lib/services/submissao/SubmissaoService"
import { referenciaService } from "@/lib/services/referencia/ReferenciaService"
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
  const [loadingPreviousSubmission, setLoadingPreviousSubmission] = React.useState(true)
  const [isResubmissao, setIsResubmissao] = React.useState(false)
  const [versaoAnterior, setVersaoAnterior] = React.useState(1)
  const [submissaoOriginalId, setSubmissaoOriginalId] = React.useState<number | null>(null)
  
  // Objeto em construção - montado progressivamente
  const [informacoesBasicas, setInformacoesBasicas] = React.useState<InformacoesBasicasFormValues | null>(null)
  const [dois, setDois] = React.useState<string[]>([])
  const [arquivo, setArquivo] = React.useState<File | null>(null)

  // Carregar dados da submissão anterior se for resubmissão
  React.useEffect(() => {
    const loadPreviousSubmission = async () => {
      if (!eventoId || !trilhaTematicaId || isNaN(eventoId) || isNaN(trilhaTematicaId)) {
        toast.error("Parâmetros inválidos")
        router.push("/eventos")
        return
      }

      try {
        setLoadingPreviousSubmission(true)
        
        // Verificar se existe submissão anterior
        const verificacao = await submissaoService.verificarSubmissaoAutor(eventoId, trilhaTematicaId)
        
        if (verificacao.existeSubmissao && 
            verificacao.status === StatusSubmissao.APROVADA_COM_RESSALVAS && 
            verificacao.submissaoId) {
          
          setIsResubmissao(true)
          
          // Buscar dados completos da submissão anterior
          const submissaoAnterior = await submissaoService.getById(verificacao.submissaoId)
          setVersaoAnterior(submissaoAnterior.versao)
          
          // Determinar o ID da submissão original
          // Se a submissão anterior já tem um SubmissaoOriginalId, usa esse
          // Caso contrário, a própria submissão anterior é a original
          const idOriginal = submissaoAnterior.submissaoOriginalId || verificacao.submissaoId
          setSubmissaoOriginalId(idOriginal)
          
          // Preencher informações básicas
          setInformacoesBasicas({
            titulo: submissaoAnterior.titulo,
            resumo: submissaoAnterior.resumo,
            palavrasChave: submissaoAnterior.palavrasChave || [],
            formato: submissaoAnterior.formato,
          })
          
          // Buscar referências da submissão anterior e extrair DOIs
          try {
            const referencias = await referenciaService.getBySubmissao(verificacao.submissaoId)
            const doisAnteriores = referencias
              .filter(ref => ref.doiCodigo)
              .map(ref => ref.doiCodigo!)
            
            if (doisAnteriores.length > 0) {
              setDois(doisAnteriores)
            }
          } catch (refError) {
            console.error("Erro ao buscar referências da submissão anterior:", refError)
            // Não bloqueia o processo se houver erro ao buscar referências
          }
          
          toast.success("Dados da submissão anterior carregados! Você pode atualizar as informações.")
        }
      } catch (error: any) {
        console.error("Erro ao verificar submissão anterior:", error)
        // Não mostra erro ao usuário, apenas continua com submissão nova
      } finally {
        setLoadingPreviousSubmission(false)
      }
    }

    loadPreviousSubmission()
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
        versao: isResubmissao ? versaoAnterior + 1 : 1,
        status: StatusSubmissao.SUBMETIDA,
        formato: informacoesBasicas.formato,
        eventoId: eventoId,
        trilhaTematicaId: trilhaTematicaId,
        submissaoOriginalId: isResubmissao && submissaoOriginalId ? submissaoOriginalId : undefined,
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
        toast.success(isResubmissao ? "Resubmissão realizada com sucesso!" : "Submissão realizada com sucesso!")
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

  if (loadingPreviousSubmission) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Carregando dados da submissão anterior...</p>
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
        
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isResubmissao ? "Refazer Submissão" : "Nova Submissão"}
            </h1>
            <p className="text-muted-foreground">
              {isResubmissao 
                ? "Os dados da submissão anterior foram carregados. Atualize as informações necessárias."
                : "Preencha as informações abaixo para submeter seu trabalho"}
            </p>
          </div>
        </div>
        
        {isResubmissao && (
          <Card className="mt-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                    Esta é uma resubmissão (versão {versaoAnterior + 1})
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Você está atualizando uma submissão aprovada com ressalvas. 
                    Os dados da versão anterior foram carregados automaticamente. 
                    Revise e atualize as informações conforme necessário.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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

