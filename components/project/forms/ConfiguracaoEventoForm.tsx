"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Users, Loader2, Eye, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const configuracaoEventoSchema = z.object({
  prazoSubmissao: z
    .string()
    .min(1, "Prazo de submissão é obrigatório"),
  prazoAvaliacao: z
    .string()
    .min(1, "Prazo de avaliação é obrigatório"),
  numeroAvaliadoresPorSubmissao: z
    .number()
    .min(1, "Número de avaliadores deve ser pelo menos 1")
    .int("Número de avaliadores deve ser um número inteiro"),
  avaliacaoDuploCego: z.boolean(),
  permiteResubmissao: z.boolean(),
}).refine(
  (data) => {
    const prazoSubmissao = new Date(data.prazoSubmissao);
    const prazoAvaliacao = new Date(data.prazoAvaliacao);
    return prazoAvaliacao >= prazoSubmissao;
  },
  {
    message: "Prazo de avaliação deve ser posterior ou igual ao prazo de submissão",
    path: ["prazoAvaliacao"],
  }
);

type ConfiguracaoEventoFormValues = z.infer<typeof configuracaoEventoSchema>;

interface ConfiguracaoEventoFormProps {
  onBack: () => void;
  onSubmit: (data: ConfiguracaoEventoFormValues) => Promise<void>;
  initialData?: Partial<ConfiguracaoEventoFormValues>;
  disabled?: boolean;
}

export default function ConfiguracaoEventoForm({ 
  onBack,
  onSubmit,
  initialData,
  disabled = false
}: ConfiguracaoEventoFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ConfiguracaoEventoFormValues>({
    resolver: zodResolver(configuracaoEventoSchema),
    defaultValues: {
      prazoSubmissao: initialData?.prazoSubmissao || "",
      prazoAvaliacao: initialData?.prazoAvaliacao || "",
      numeroAvaliadoresPorSubmissao: initialData?.numeroAvaliadoresPorSubmissao || 1,
      avaliacaoDuploCego: initialData?.avaliacaoDuploCego ?? false,
      permiteResubmissao: initialData?.permiteResubmissao ?? false,
    },
  });

  const handleSubmit = async (values: ConfiguracaoEventoFormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(values);
    } catch (error) {
      // Erro já tratado no componente pai
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prazoSubmissao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo de Submissão</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      className="pl-9"
                      disabled={isLoading || disabled}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prazoAvaliacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo de Avaliação</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      className="pl-9"
                      disabled={isLoading || disabled}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="numeroAvaliadoresPorSubmissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Avaliadores por Submissão</FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="pl-9"
                    disabled={isLoading || disabled}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    value={field.value}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Quantidade de avaliadores que irão avaliar cada submissão
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="avaliacaoDuploCego"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || disabled}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Avaliação Duplo Cego
                  </FormLabel>
                  <FormDescription>
                    Os avaliadores não verão informações dos autores durante a avaliação
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="permiteResubmissao"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || disabled}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Permite Resubmissão
                  </FormLabel>
                  <FormDescription>
                    Permite que autores reenviem trabalhos após avaliação
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button 
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isLoading || disabled}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isLoading || disabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Evento"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
