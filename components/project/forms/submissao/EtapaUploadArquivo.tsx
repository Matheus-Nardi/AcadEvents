"use client"

import React from "react"
import { Upload, File, X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface EtapaUploadArquivoProps {
  arquivo: File | null
  onArquivoChange: (arquivo: File | null) => void
  onBack: () => void
  onComplete: (arquivo: File) => void
  isLoading?: boolean
}

// Tipos de arquivo permitidos para submissões científicas
const TIPOS_PERMITIDOS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]

const EXTENSOES_PERMITIDAS = [".pdf", ".doc", ".docx"]

export function EtapaUploadArquivo({
  arquivo,
  onArquivoChange,
  onBack,
  onComplete,
  isLoading = false,
}: EtapaUploadArquivoProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!validateFile(file)) {
      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    onArquivoChange(file)
    toast.success("Arquivo selecionado!")
    
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
                disabled={isLoading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">
                  Clique para selecionar ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC ou DOCX (máximo 10MB)
                </p>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Arquivo Selecionado
          </h3>
        </div>

        {!arquivo ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <File className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhum arquivo selecionado ainda.
                <br />
                Use o campo acima para selecionar o arquivo. (Obrigatório)
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3 flex-1">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{arquivo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(arquivo.size)} • {arquivo.type || "Tipo não identificado"}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  onArquivoChange(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Voltar
        </Button>
        <Button
          type="button"
          onClick={() => arquivo && onComplete(arquivo)}
          disabled={!arquivo || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizando...
            </>
          ) : (
            "Finalizar Submissão"
          )}
        </Button>
      </div>
    </div>
  )
}

