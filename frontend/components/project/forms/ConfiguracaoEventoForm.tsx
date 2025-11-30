"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Users, Loader2, ArrowLeft } from "lucide-react";
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
    .min(1, "Prazo de submissão é obrigatório")
    .refine(
      (dateString) => {
        const dataSubmissao = new Date(dateString);
        const agora = new Date();
        // Remove os milissegundos para comparar apenas até os segundos
        agora.setMilliseconds(0);
        dataSubmissao.setMilliseconds(0);
        return dataSubmissao >= agora;
      },
      {
        message: "O prazo de submissão deve ser a partir da data e hora atual",
      }
    ),
  prazoAvaliacao: z
    .string()
    .min(1, "Prazo de avaliação é obrigatório"),
  numeroAvaliadoresPorSubmissao: z
    .number()
    .min(1, "Número de avaliadores deve ser pelo menos 1")
    .int("Número de avaliadores deve ser um número inteiro"),
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

  // Obter data/hora mínima para o input (agora)
  const getMinDateTime = () => {
    const agora = new Date();
    // Formato para datetime-local: YYYY-MM-DDTHH:mm
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    return `${ano}-${mes}-${dia}T${horas}:${minutos}`;
  };

  const form = useForm<ConfiguracaoEventoFormValues>({
    resolver: zodResolver(configuracaoEventoSchema),
    defaultValues: {
      prazoSubmissao: initialData?.prazoSubmissao || "",
      prazoAvaliacao: initialData?.prazoAvaliacao || "",
      numeroAvaliadoresPorSubmissao: initialData?.numeroAvaliadoresPorSubmissao || 1,
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
                      min={getMinDateTime()}
                      disabled={isLoading || disabled}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  O prazo de submissão deve ser a partir da data e hora atual
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prazoAvaliacao"
            render={({ field }) => {
              const prazoSubmissao = form.watch("prazoSubmissao");
              const getMinAvaliacao = () => {
                if (!prazoSubmissao) {
                  return getMinDateTime();
                }
                // O prazo de avaliação deve ser >= prazo de submissão
                const dataSubmissao = new Date(prazoSubmissao);
                const ano = dataSubmissao.getFullYear();
                const mes = String(dataSubmissao.getMonth() + 1).padStart(2, '0');
                const dia = String(dataSubmissao.getDate()).padStart(2, '0');
                const horas = String(dataSubmissao.getHours()).padStart(2, '0');
                const minutos = String(dataSubmissao.getMinutes()).padStart(2, '0');
                return `${ano}-${mes}-${dia}T${horas}:${minutos}`;
              };

              return (
                <FormItem>
                  <FormLabel>Prazo de Avaliação</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        className="pl-9"
                        min={getMinAvaliacao()}
                        disabled={isLoading || disabled}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    O prazo de avaliação deve ser posterior ou igual ao prazo de submissão
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
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
