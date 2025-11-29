"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileText, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormatoSubmissao } from "@/types/submissao/FormatoSubmissao"

const MIN_RESUMO = 100

const informacoesBasicasSchema = z.object({
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .min(10, "Título deve ter pelo menos 10 caracteres"),
  resumo: z
    .string()
    .min(1, "Resumo é obrigatório")
    .min(MIN_RESUMO, `Resumo deve ter pelo menos ${MIN_RESUMO} caracteres`),
  palavrasChave: z
    .array(z.string().min(1, "Palavra-chave não pode estar vazia"))
    .min(3, "Informe pelo menos 3 palavras-chave"),
  formato: z.nativeEnum(FormatoSubmissao).refine(
    (val) => val !== undefined,
    { message: "Formato é obrigatório" }
  ),
})

export type InformacoesBasicasFormValues = z.infer<typeof informacoesBasicasSchema>

interface EtapaInformacoesBasicasProps {
  onSubmit: (data: InformacoesBasicasFormValues) => void | Promise<void>
  defaultValues?: Partial<InformacoesBasicasFormValues>
  isLoading?: boolean
}

export function EtapaInformacoesBasicas({
  onSubmit,
  defaultValues,
  isLoading = false,
}: EtapaInformacoesBasicasProps) {
  // Converter palavras-chave de string para array se necessário
  const palavrasChaveInicial = React.useMemo(() => {
    if (!defaultValues?.palavrasChave) return []
    if (Array.isArray(defaultValues.palavrasChave)) {
      return defaultValues.palavrasChave
    }
    // Se for string, converter para array
    return (defaultValues.palavrasChave as string)
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length > 0)
  }, [defaultValues?.palavrasChave])

  const form = useForm<InformacoesBasicasFormValues>({
    resolver: zodResolver(informacoesBasicasSchema),
    defaultValues: {
      titulo: defaultValues?.titulo || "",
      resumo: defaultValues?.resumo || "",
      palavrasChave: palavrasChaveInicial,
      formato: defaultValues?.formato,
    },
  })

  const palavrasChaveValue = form.watch("palavrasChave")
  const [tagInput, setTagInput] = React.useState("")

  const handleSubmit = async (data: InformacoesBasicasFormValues) => {
    await onSubmit(data)
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const currentTags = form.getValues("palavrasChave") || []
      const newTag = tagInput.trim()
      
      // Não adicionar se já existir
      if (!currentTags.includes(newTag)) {
        form.setValue("palavrasChave", [...currentTags, newTag], {
          shouldValidate: true,
        })
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("palavrasChave") || []
    form.setValue(
      "palavrasChave",
      currentTags.filter(tag => tag !== tagToRemove),
      { shouldValidate: true }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o título da submissão"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Título completo e descritivo da sua submissão
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resumo"
          render={({ field }) => {
            const qtdDigitada = field.value?.length || 0
            const mostrarContador = qtdDigitada < MIN_RESUMO

            return (
              <FormItem>
                <FormLabel>Resumo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Digite o resumo da submissão"
                      className="min-h-32 pr-16"
                      disabled={isLoading}
                      {...field}
                    />
                    {mostrarContador && (
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {qtdDigitada} / {MIN_RESUMO}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Resumo completo do trabalho (mínimo {MIN_RESUMO} caracteres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="palavrasChave"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palavras-chave</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {/* Tags existentes */}
                  {palavrasChaveValue && palavrasChaveValue.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 min-h-[3rem] border rounded-md bg-muted/30">
                      {palavrasChaveValue.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
                        >
                          {tag}
                          {!isLoading && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                              aria-label={`Remover ${tag}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Input para nova tag */}
                  <Input
                    placeholder="Digite uma palavra-chave e pressione Enter"
                    disabled={isLoading}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Pressione Enter para adicionar uma palavra-chave (mínimo 3 palavras-chave)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formato"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={FormatoSubmissao.ARTIGO_COMPLETO}>
                    Artigo Completo
                  </SelectItem>
                  <SelectItem value={FormatoSubmissao.ARTIGO_RESUMIDO}>
                    Artigo Resumido
                  </SelectItem>
                  <SelectItem value={FormatoSubmissao.POSTER}>
                    Poster
                  </SelectItem>
                  <SelectItem value={FormatoSubmissao.RESUMO_EXPANDIDO}>
                    Resumo Expandido
                  </SelectItem>
                  <SelectItem value={FormatoSubmissao.WORKSHOP}>
                    Workshop
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione o formato da sua submissão
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Salvar e Continuar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

