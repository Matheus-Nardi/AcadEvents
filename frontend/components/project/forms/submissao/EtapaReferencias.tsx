"use client"

import React from "react"
import { X, Loader2, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { crossrefService } from "@/lib/services/crossref/CrossrefService"
import { ReferenciaCrossref } from "@/types/crossref/CrossrefWork"

interface ReferenciaComInfo {
  doi: string
  info?: ReferenciaCrossref
  loading?: boolean
  error?: string
}

interface EtapaReferenciasProps {
  dois: string[]
  onDoisChange: (dois: string[]) => void
  onNext: (dois: string[]) => void
  onBack: () => void
}

export function EtapaReferencias({
  dois,
  onDoisChange,
  onNext,
  onBack,
}: EtapaReferenciasProps) {
  const [doiInput, setDoiInput] = React.useState("")
  const [referencias, setReferencias] = React.useState<ReferenciaComInfo[]>([])
  const [loadingDoi, setLoadingDoi] = React.useState(false)

  // Sincroniza referencias com dois quando dois mudam externamente
  React.useEffect(() => {
    setReferencias((prevReferencias) => {
      const novasReferencias: ReferenciaComInfo[] = dois.map((doi) => {
        const existente = prevReferencias.find((ref) => ref.doi === doi)
        return existente || { doi }
      })
      return novasReferencias
    })
  }, [dois])

  const handleAddDoi = async () => {
    if (!doiInput.trim()) {
      toast.error("Por favor, informe um DOI")
      return
    }

    // Normaliza o DOI (remove https://doi.org/ se presente)
    const doiNormalizado = doiInput.trim().replace(/^https?:\/\/doi\.org\//i, "")
    
    // Verifica se já existe
    if (dois.includes(doiNormalizado)) {
      toast.error("Este DOI já foi adicionado")
      return
    }

    // Valida formato básico
    if (!crossrefService.validarFormatoDoi(doiNormalizado)) {
      toast.error("Formato de DOI inválido")
      return
    }

    // Adiciona o DOI imediatamente
    onDoisChange([...dois, doiNormalizado])
    
    // Cria referência com loading
    const novaReferencia: ReferenciaComInfo = {
      doi: doiNormalizado,
      loading: true,
    }
    setReferencias([...referencias, novaReferencia])
    setDoiInput("")

    // Busca informações no Crossref
    try {
      setLoadingDoi(true)
      const info = await crossrefService.buscarPorDoi(doiNormalizado)
      
      setReferencias((prev) =>
        prev.map((ref) =>
          ref.doi === doiNormalizado
            ? { ...ref, info, loading: false }
            : ref
        )
      )
      toast.success("Referência encontrada e adicionada!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar referência"
      
      setReferencias((prev) =>
        prev.map((ref) =>
          ref.doi === doiNormalizado
            ? { ...ref, loading: false, error: errorMessage }
            : ref
        )
      )
      toast.warning(`DOI adicionado, mas não foi possível buscar informações: ${errorMessage}`)
    } finally {
      setLoadingDoi(false)
    }
  }

  const handleRemoveDoi = (doiToRemove: string) => {
    onDoisChange(dois.filter((doi) => doi !== doiToRemove))
    setReferencias(referencias.filter((ref) => ref.doi !== doiToRemove))
    toast.success("DOI removido")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddDoi()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Adicionar Referências por DOI</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Informe os códigos DOI das referências. Elas serão processadas automaticamente ao finalizar a submissão.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Ex: 10.1000/182 ou https://doi.org/10.1000/182"
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loadingDoi}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddDoi}
            disabled={!doiInput.trim() || loadingDoi}
          >
            {loadingDoi ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              "Adicionar"
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Referências Adicionadas ({dois.length})
          </h3>
        </div>

        {dois.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma referência adicionada ainda.
                <br />
                Use o campo acima para adicionar DOIs. (Opcional)
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {referencias.map((ref, index) => (
              <Card key={index}>
                <CardContent className="py-4">
                  {ref.loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Buscando informações...</p>
                        <p className="text-xs text-muted-foreground mt-1">{ref.doi}</p>
                      </div>
                    </div>
                  ) : ref.error ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">
                            Erro ao buscar referência
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{ref.doi}</p>
                          <p className="text-xs text-muted-foreground mt-1">{ref.error}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDoi(ref.doi)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : ref.info ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          {ref.info.titulo && (
                            <p className="text-sm font-semibold leading-tight">
                              {ref.info.titulo}
                            </p>
                          )}
                          {ref.info.autores && (
                            <p className="text-xs text-muted-foreground">
                              {ref.info.autores}
                              {ref.info.ano && ` (${ref.info.ano})`}
                            </p>
                          )}
                          {ref.info.publicacao && (
                            <p className="text-xs text-muted-foreground">
                              {ref.info.publicacao}
                              {ref.info.publisher && ` - ${ref.info.publisher}`}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <a
                              href={`https://doi.org/${ref.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {ref.doi}
                            </a>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDoi(ref.doi)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{ref.doi}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDoi(ref.doi)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" onClick={() => onNext(dois)}>
          Continuar
        </Button>
      </div>
    </div>
  )
}

