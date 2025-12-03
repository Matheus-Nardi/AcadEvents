"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, User } from "lucide-react";
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
});

type TrilhaFormValues = z.infer<typeof trilhaSchema>;

interface TrilhaFormProps {
  onNext: (data: TrilhaFormValues) => void;
  initialData?: Partial<TrilhaFormValues>;
  disabled?: boolean;
}

export default function TrilhaForm({
  onNext,
  initialData,
  disabled = false,
}: TrilhaFormProps) {
  const form = useForm<TrilhaFormValues>({
    resolver: zodResolver(trilhaSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      coordenador: initialData?.coordenador || "",
    },
  });

  const onSubmit = (values: TrilhaFormValues) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    disabled={disabled}
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
                    disabled={disabled}
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
                    disabled={disabled}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={disabled}
        >
          Próximo: Trilhas Temáticas
        </Button>
      </form>
    </Form>
  );
}

