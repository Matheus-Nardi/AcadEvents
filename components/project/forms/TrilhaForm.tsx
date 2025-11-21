"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, User, Hash, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

const trilhaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome da trilha é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  coordenador: z
    .string()
    .min(1, "Coordenador é obrigatório")
    .min(3, "Nome do coordenador deve ter pelo menos 3 caracteres"),
  limiteSubmissoes: z
    .number()
    .min(1, "Limite de submissões deve ser pelo menos 1")
    .int("Limite de submissões deve ser um número inteiro"),
});

type TrilhaFormValues = z.infer<typeof trilhaSchema>;

interface TrilhaFormProps {
  onSubmit: (data: TrilhaFormValues) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<TrilhaFormValues>;
  disabled?: boolean;
}

export default function TrilhaForm({
  onSubmit,
  onCancel,
  initialData,
  disabled = false,
}: TrilhaFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<TrilhaFormValues>({
    resolver: zodResolver(trilhaSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      coordenador: initialData?.coordenador || "",
      limiteSubmissoes: initialData?.limiteSubmissoes || 1,
    },
  });

  const handleSubmit = async (values: TrilhaFormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(values);
      form.reset();
    } catch (error) {
      // Erro já tratado no componente pai
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Trilha</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Computação e Tecnologia"
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
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a trilha, seus objetivos e áreas de interesse..."
                  className="min-h-[100px]"
                  disabled={isLoading || disabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Forneça uma descrição detalhada da trilha temática
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coordenador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordenador</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Nome do coordenador"
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
            name="limiteSubmissoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de Submissões</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  Número máximo de submissões permitidas nesta trilha
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading || disabled}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            className={onCancel ? "flex-1" : "w-full"}
            disabled={isLoading || disabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Trilha"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

