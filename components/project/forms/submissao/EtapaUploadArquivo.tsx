"use client"

import React from "react"
import { Upload, File, X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { arquivoSubmissaoService } from "@/lib/services/submissao/ArquivoSubmissaoService"
import { ArquivoSubmissao } from "@/types/submissao/ArquivoSubmissao"
import { toast } from "sonner"

interface EtapaUploadArquivoProps {
  submissaoId: number
  arquivos: ArquivoSubmissao[]
  onArquivosChange: (arquivos: ArquivoSubmissao[]) => void
  onBack: () => void
  onComplete: () => void
}

// Tipos de arquivo permitidos para submissões científicas
const TIPOS_PERMITIDOS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]

const EXTENSOES_PERMITIDAS = [".pdf", ".doc", ".docx"]

export function EtapaUploadArquivo({
  submissaoId,
  arquivos,
  onArquivosChange,
  onBack,
  onComplete,
}: EtapaUploadArquivoProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [isLoadingArquivos, setIsLoadingArquivos] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const loadArquivos = async () => {
      try {
        setIsLoadingArquivos(true)
        const arquivosList = await arquivoSubmissaoService.listarPorSubmissao(submissaoId)
        onArquivosChange(arquivosList)
      } catch (error) {
        console.error("Erro ao carregar arquivos:", error)
      } finally {
        setIsLoadingArquivos(false)
      }
    }

    if (submissaoId) {
      loadArquivos()
    }
  }, [submissaoId, onArquivosChange])

  const validateFile = (file: File): boolean => {
    // Verifica tipo MIME
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      // Verifica extensão como fallback
      const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      if (!EXTENSOES_PERMITIDAS.includes(extension)) {
        toast.error(
          "Tipo de arquivo não permitido. Apenas PDF, DOC e DOCX são aceitos."
        )
        return false
      }
    }

    // Verifica tamanho (limite de 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. O tamanho máximo é 10MB.")
      return false
    }

    return true
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!validateFile(file)) {
      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    try {
      setIsUploading(true)
      const novoArquivo = await arquivoSubmissaoService.upload(submissaoId, file)
      onArquivosChange([...arquivos, novoArquivo])
      toast.success("Arquivo enviado com sucesso!")
      
      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao fazer upload do arquivo."
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Enviar Arquivo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Envie o arquivo da sua submissão. Formatos aceitos: PDF, DOC, DOCX (máximo 10MB)
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-sm font-medium">Enviando arquivo...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-1">
                      Clique para selecionar ou arraste o arquivo aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC ou DOCX (máximo 10MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Arquivos Enviados ({arquivos.length})
          </h3>
        </div>

        {isLoadingArquivos ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : arquivos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <File className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhum arquivo enviado ainda.
                <br />
                Use o campo acima para fazer upload do arquivo.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {arquivos.map((arquivo) => (
              <Card key={arquivo.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">{arquivo.nomeArquivo}</CardTitle>
                        {arquivo.versao > 1 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Versão {arquivo.versao}
                          </span>
                        )}
                      </div>
                      <CardDescription className="space-y-1">
                        <p>
                          <span className="font-medium">Tamanho:</span> {formatFileSize(arquivo.tamanho)}
                        </p>
                        <p>
                          <span className="font-medium">Tipo:</span> {arquivo.tipo}
                        </p>
                        <p>
                          <span className="font-medium">Enviado em:</span> {formatDate(arquivo.dataUpload)}
                        </p>
                      </CardDescription>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-1" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onComplete}
          disabled={arquivos.length === 0}
        >
          Finalizar Submissão
        </Button>
      </div>
    </div>
  )
}

