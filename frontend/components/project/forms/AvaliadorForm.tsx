"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, Building2, Globe, Briefcase, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { avaliadorService } from "@/lib/services/usuario/AvaliadorService";
import { useAuth } from "@/hooks/useAuth";

const avaliadorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  instituicao: z.string().min(1, "Instituição é obrigatória"),
  pais: z.string().min(1, "País é obrigatório"),
  especialidades: z.array(z.string()).min(1, "Adicione pelo menos uma especialidade"),
  disponibilidade: z.boolean(),
});

type AvaliadorFormValues = z.infer<typeof avaliadorSchema>;

export function AvaliadorForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [especialidadeInput, setEspecialidadeInput] = React.useState("");

  const form = useForm<AvaliadorFormValues>({
    resolver: zodResolver(avaliadorSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      instituicao: "",
      pais: "",
      especialidades: [],
      disponibilidade: true,
    },
  });

  const especialidades = form.watch("especialidades");

  const addEspecialidade = () => {
    if (especialidadeInput.trim() && !especialidades.includes(especialidadeInput.trim())) {
      form.setValue("especialidades", [...especialidades, especialidadeInput.trim()]);
      setEspecialidadeInput("");
    }
  };

  const removeEspecialidade = (especialidade: string) => {
    form.setValue("especialidades", especialidades.filter(e => e !== especialidade));
  };

  const onSubmit = async (values: AvaliadorFormValues) => {
    try {
      setIsLoading(true);
      await avaliadorService.create({
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        instituicao: values.instituicao,
        pais: values.pais,
        ativo: true,
        especialidades: values.especialidades,
        disponibilidade: values.disponibilidade,
        perfilORCIDId: null,
      });
      toast.success("Conta criada com sucesso! Fazendo login...");
      await login({
        email: values.email,
        password: values.senha,
      });
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data || 
        error?.message ||
        "Erro ao criar conta. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Seu nome completo"
                    className="pl-9"
                    disabled={isLoading}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-9"
                    disabled={isLoading}
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
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    disabled={isLoading}
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
          name="instituicao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instituição</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nome da instituição"
                    className="pl-9"
                    disabled={isLoading}
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
          name="pais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Seu país"
                    className="pl-9"
                    disabled={isLoading}
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
          name="especialidades"
          render={() => (
            <FormItem>
              <FormLabel>Especialidades</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Machine Learning, IA..."
                      value={especialidadeInput}
                      onChange={(e) => setEspecialidadeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEspecialidade();
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addEspecialidade}
                      disabled={isLoading}
                    >
                      Adicionar
                    </Button>
                  </div>
                  {especialidades.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {especialidades.map((esp) => (
                        <div
                          key={esp}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                        >
                          <span>{esp}</span>
                          <button
                            type="button"
                            onClick={() => removeEspecialidade(esp)}
                            disabled={isLoading}
                            className="hover:bg-primary/20 rounded p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="disponibilidade"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Disponível para avaliações</FormLabel>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>
    </Form>
  );
}

