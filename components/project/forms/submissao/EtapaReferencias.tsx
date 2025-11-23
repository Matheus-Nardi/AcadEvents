"use client"

import React from "react"
import { X, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

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

  const handleAddDoi = () => {
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

    onDoisChange([...dois, doiNormalizado])
    setDoiInput("")
    toast.success("DOI adicionado!")
  }

  const handleRemoveDoi = (doiToRemove: string) => {
    onDoisChange(dois.filter((doi) => doi !== doiToRemove))
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
            />
          </div>
          <Button
            type="button"
            onClick={handleAddDoi}
            disabled={!doiInput.trim()}
          >
            Adicionar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            DOIs Adicionados ({dois.length})
          </h3>
        </div>

        {dois.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhum DOI adicionado ainda.
                <br />
                Use o campo acima para adicionar DOIs. (Opcional)
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {dois.map((doi, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doi}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDoi(doi)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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

