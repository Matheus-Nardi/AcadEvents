"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileText, Loader2 } from "lucide-react"
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

const informacoesBasicasSchema = z.object({
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .min(10, "Título deve ter pelo menos 10 caracteres"),
  resumo: z
    .string()
    .min(1, "Resumo é obrigatório")
    .min(100, "Resumo deve ter pelo menos 100 caracteres"),
  palavrasChave: z
    .string()
    .min(1, "Palavras-chave são obrigatórias")
    .refine(
      (val) => val.split(",").filter((p) => p.trim().length > 0).length >= 3,
      "Informe pelo menos 3 palavras-chave separadas por vírgula"
    ),
  formato: z.nativeEnum(FormatoSubmissao, {
    required_error: "Formato é obrigatório",
  }),
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
  const form = useForm<InformacoesBasicasFormValues>({
    resolver: zodResolver(informacoesBasicasSchema),
    defaultValues: {
      titulo: defaultValues?.titulo || "",
      resumo: defaultValues?.resumo || "",
      palavrasChave: defaultValues?.palavrasChave || "",
      formato: defaultValues?.formato,
    },
  })

  const handleSubmit = async (data: InformacoesBasicasFormValues) => {
    await onSubmit(data)
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite o resumo da submissão"
                  className="min-h-32"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Resumo completo do trabalho (mínimo 100 caracteres)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="palavrasChave"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palavras-chave</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: inteligência artificial, machine learning, deep learning"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Separe as palavras-chave por vírgula (mínimo 3 palavras-chave)
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

