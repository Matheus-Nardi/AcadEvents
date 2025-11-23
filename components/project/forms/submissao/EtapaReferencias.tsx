"use client"

import React from "react"
import { Search, Plus, X, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Referencia } from "@/types/referencia/Referencia"
import { referenciaService } from "@/lib/services/referencia/ReferenciaService"
import { toast } from "sonner"

interface EtapaReferenciasProps {
  submissaoId: number
  referencias: Referencia[]
  onReferenciasChange: (referencias: Referencia[]) => void
  onNext: () => void
  onBack: () => void
}

export function EtapaReferencias({
  submissaoId,
  referencias,
  onReferenciasChange,
  onNext,
  onBack,
}: EtapaReferenciasProps) {
  const [doiInput, setDoiInput] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [isLoadingReferencias, setIsLoadingReferencias] = React.useState(false)

  React.useEffect(() => {
    const loadReferencias = async () => {
      try {
        setIsLoadingReferencias(true)
        const refs = await referenciaService.getBySubmissao(submissaoId)
        onReferenciasChange(refs)
      } catch (error) {
        console.error("Erro ao carregar referências:", error)
      } finally {
        setIsLoadingReferencias(false)
      }
    }

    if (submissaoId) {
      loadReferencias()
    }
  }, [submissaoId, onReferenciasChange])

  const handleAddReferencia = async () => {
    if (!doiInput.trim()) {
      toast.error("Por favor, informe um DOI")
      return
    }

    try {
      setIsSearching(true)
      const novaReferencia = await referenciaService.createFromDoi(
        submissaoId,
        doiInput.trim()
      )
      
      onReferenciasChange([...referencias, novaReferencia])
      setDoiInput("")
      toast.success("Referência adicionada com sucesso!")
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao buscar referência. Verifique se o DOI está correto."
      toast.error(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRemoveReferencia = async (referenciaId: number) => {
    // Nota: Se houver um método de delete no service, usar aqui
    // Por enquanto, apenas remove da lista local
    onReferenciasChange(referencias.filter((ref) => ref.id !== referenciaId))
    toast.success("Referência removida")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddReferencia()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Adicionar Referência por DOI</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Informe o código DOI para buscar e adicionar automaticamente a referência
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Ex: 10.1000/182 ou https://doi.org/10.1000/182"
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddReferencia}
            disabled={isSearching || !doiInput.trim()}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Referências Adicionadas ({referencias.length})
          </h3>
        </div>

        {isLoadingReferencias ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : referencias.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma referência adicionada ainda.
                <br />
                Use o campo acima para adicionar referências por DOI.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {referencias.map((referencia) => (
              <Card key={referencia.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">
                        {referencia.titulo}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <p>
                          <span className="font-medium">Autores:</span> {referencia.autores}
                        </p>
                        <p>
                          <span className="font-medium">Ano:</span> {referencia.ano}
                        </p>
                        {referencia.publicacao && (
                          <p>
                            <span className="font-medium">Publicação:</span> {referencia.publicacao}
                          </p>
                        )}
                        {referencia.doiCodigo && (
                          <p>
                            <span className="font-medium">DOI:</span> {referencia.doiCodigo}
                          </p>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveReferencia(referencia.id)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
        <Button type="button" onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  )
}

