"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, ArrowLeft, CheckCircle2, X, Loader2 } from "lucide-react";
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
import TrilhaTematicaForm from "./TrilhaTematicaForm";
import { TrilhaTematicaRequest } from "@/types/trilha-tematica/TrilhaTematicaRequest";

const trilhasTematicasSchema = z.object({
  trilhasTematicas: z.array(
    z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      descricao: z.string().min(1, "Descrição é obrigatória"),
      palavrasChave: z.array(z.string()).min(1, "Adicione pelo menos uma palavra-chave"),
    })
  ).optional(),
});

type TrilhasTematicasFormValues = z.infer<typeof trilhasTematicasSchema>;

interface TrilhaTematicaFormData {
  nome: string;
  descricao: string;
  palavrasChave: string[];
}

interface TrilhasTematicasFormProps {
  onBack: () => void;
  onSubmit: (trilhasTematicas: TrilhaTematicaRequest[]) => Promise<void>;
  disabled?: boolean;
}

export default function TrilhasTematicasForm({
  onBack,
  onSubmit,
  disabled = false,
}: TrilhasTematicasFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [trilhasTematicas, setTrilhasTematicas] = React.useState<TrilhaTematicaFormData[]>([]);
  const [showAddForm, setShowAddForm] = React.useState(false);

  const form = useForm<TrilhasTematicasFormValues>({
    resolver: zodResolver(trilhasTematicasSchema),
    defaultValues: {
      trilhasTematicas: [],
    },
  });

  const handleAddTrilhaTematica = (data: TrilhaTematicaFormData) => {
    setTrilhasTematicas([...trilhasTematicas, data]);
    setShowAddForm(false);
  };

  const handleRemoveTrilhaTematica = (index: number) => {
    setTrilhasTematicas(trilhasTematicas.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onSubmit(trilhasTematicas);
    } catch (error) {
      // Erro já tratado no componente pai
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Trilhas Temáticas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione uma ou mais trilhas temáticas para esta trilha. Você pode adicionar quantas quiser.
        </p>
      </div>

      {/* Lista de trilhas temáticas adicionadas */}
      {trilhasTematicas.length > 0 && (
        <div className="space-y-3">
          {trilhasTematicas.map((trilhaTematica, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-card space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{trilhaTematica.nome}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {trilhaTematica.descricao}
                  </p>
                  {trilhaTematica.palavrasChave.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {trilhaTematica.palavrasChave.map((palavra, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {palavra}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTrilhaTematica(index)}
                  disabled={isLoading || disabled}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário para adicionar nova trilha temática */}
      {showAddForm ? (
        <div className="border rounded-lg p-4 bg-card">
          <TrilhaTematicaForm
            onSubmit={async (data) => handleAddTrilhaTematica(data)}
            onCancel={() => setShowAddForm(false)}
            disabled={isLoading || disabled}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          disabled={isLoading || disabled}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Trilha Temática
        </Button>
      )}

      {/* Botões de navegação */}
      <div className="flex gap-4 pt-4 border-t">
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
          type="button"
          onClick={handleSubmit}
          className="flex-1"
          disabled={isLoading || disabled || trilhasTematicas.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Finalizar"
          )}
        </Button>
      </div>
    </div>
  );
}

