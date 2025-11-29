"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Tag, X, Plus, Loader2 } from "lucide-react";
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

const trilhaTematicaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome da trilha temática é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  palavrasChave: z
    .array(z.string().min(1, "Palavra-chave não pode estar vazia"))
    .min(1, "Adicione pelo menos uma palavra-chave"),
});

type TrilhaTematicaFormValues = z.infer<typeof trilhaTematicaSchema>;

interface TrilhaTematicaFormProps {
  onSubmit: (data: TrilhaTematicaFormValues) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<TrilhaTematicaFormValues>;
  disabled?: boolean;
}

export default function TrilhaTematicaForm({
  onSubmit,
  onCancel,
  initialData,
  disabled = false,
}: TrilhaTematicaFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [palavraChaveInput, setPalavraChaveInput] = React.useState("");

  const form = useForm<TrilhaTematicaFormValues>({
    resolver: zodResolver(trilhaTematicaSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      palavrasChave: initialData?.palavrasChave || [],
    },
  });

  const palavrasChave = form.watch("palavrasChave");

  const handleAddPalavraChave = () => {
    if (palavraChaveInput.trim() && !palavrasChave.includes(palavraChaveInput.trim())) {
      form.setValue("palavrasChave", [...palavrasChave, palavraChaveInput.trim()]);
      setPalavraChaveInput("");
    }
  };

  const handleRemovePalavraChave = (index: number) => {
    const newPalavrasChave = palavrasChave.filter((_, i) => i !== index);
    form.setValue("palavrasChave", newPalavrasChave);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPalavraChave();
    }
  };

  const handleSubmit = async (values: TrilhaTematicaFormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(values);
      form.reset();
      setPalavraChaveInput("");
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
              <FormLabel>Nome da Trilha Temática</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Inteligência Artificial e Machine Learning"
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
                  placeholder="Descreva a trilha temática, seus objetivos e áreas de interesse específicas..."
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

        <FormField
          control={form.control}
          name="palavrasChave"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palavras-chave</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Digite uma palavra-chave e pressione Enter"
                        className="pl-9"
                        disabled={isLoading || disabled}
                        value={palavraChaveInput}
                        onChange={(e) => setPalavraChaveInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddPalavraChave}
                      disabled={isLoading || disabled || !palavraChaveInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {palavrasChave.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {palavrasChave.map((palavra, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                        >
                          <span>{palavra}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePalavraChave(index)}
                            disabled={isLoading || disabled}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Adicione palavras-chave relevantes para esta trilha temática
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
              "Salvar Trilha Temática"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

