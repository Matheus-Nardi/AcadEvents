"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  FileText, 
  Users, 
  UserCheck, 
  X, 
  Search, 
  Loader2, 
  ArrowLeft,
  Briefcase,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avaliador } from "@/types/auth/Avaliador";
import { Organizador } from "@/types/auth/Organizador";
import { avaliadorService } from "@/lib/services/usuario/AvaliadorService";
import { organizadorService } from "@/lib/services/usuario/OrganizadorService";
import { toast } from "sonner";

const comiteCientificoSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome do comitê é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z
    .string()
    .min(1, "Tipo do comitê é obrigatório"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  avaliadoresIds: z
    .array(z.number())
    .min(3, "É necessário adicionar pelo menos 3 avaliadores ao comitê científico"),
  coordenadoresIds: z
    .array(z.number())
    .optional(),
});

type ComiteCientificoFormValues = z.infer<typeof comiteCientificoSchema>;

interface ComiteCientificoFormProps {
  onBack: () => void;
  onSubmit: (data: ComiteCientificoFormValues) => Promise<void>;
  initialData?: Partial<ComiteCientificoFormValues>;
  disabled?: boolean;
}

const TIPO_OPCOES = [
  { value: "Cientifico", label: "Científico" },
  { value: "Organizacao", label: "Organização" },
  { value: "Revisao", label: "Revisão" },
];


export default function ComiteCientificoForm({
  onBack,
  onSubmit,
  initialData,
  disabled = false,
}: ComiteCientificoFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [avaliadores, setAvaliadores] = React.useState<Avaliador[]>([]);
  const [organizadores, setOrganizadores] = React.useState<Organizador[]>([]);
  const [avaliadorEmailInput, setAvaliadorEmailInput] = React.useState("");
  const [organizadorEmailInput, setOrganizadorEmailInput] = React.useState("");
  const [isSearchingAvaliador, setIsSearchingAvaliador] = React.useState(false);
  const [isSearchingOrganizador, setIsSearchingOrganizador] = React.useState(false);

  const form = useForm<ComiteCientificoFormValues>({
    resolver: zodResolver(comiteCientificoSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      tipo: initialData?.tipo || "",
      descricao: initialData?.descricao || "",
      avaliadoresIds: initialData?.avaliadoresIds || [],
      coordenadoresIds: initialData?.coordenadoresIds || [],
    },
  });

  const avaliadoresIds = form.watch("avaliadoresIds") || [];
  const coordenadoresIds = form.watch("coordenadoresIds") || [];

  // Sincroniza os IDs com os objetos
  React.useEffect(() => {
    form.setValue("avaliadoresIds", avaliadores.map(a => a.id));
  }, [avaliadores, form]);

  React.useEffect(() => {
    form.setValue("coordenadoresIds", organizadores.map(o => o.id));
  }, [organizadores, form]);

  const handleBuscarAvaliador = async () => {
    if (!avaliadorEmailInput.trim()) {
      toast.error("Digite um email para buscar");
      return;
    }

    const email = avaliadorEmailInput.trim().toLowerCase();
    
    // Verifica se já foi adicionado
    if (avaliadores.some(a => a.email.toLowerCase() === email)) {
      toast.error("Este avaliador já foi adicionado");
      setAvaliadorEmailInput("");
      return;
    }

    try {
      setIsSearchingAvaliador(true);
      const avaliador = await avaliadorService.getByEmail(email);
      
      if (avaliador) {
        setAvaliadores([...avaliadores, avaliador]);
        setAvaliadorEmailInput("");
        toast.success("Avaliador adicionado com sucesso");
      } else {
        toast.error("Avaliador não encontrado com este email");
      }
    } catch (error) {
      console.error("Erro ao buscar avaliador:", error);
      toast.error("Erro ao buscar avaliador. Tente novamente.");
    } finally {
      setIsSearchingAvaliador(false);
    }
  };

  const handleBuscarOrganizador = async () => {
    if (!organizadorEmailInput.trim()) {
      toast.error("Digite um email para buscar");
      return;
    }

    const email = organizadorEmailInput.trim().toLowerCase();
    
    // Verifica se já foi adicionado
    if (organizadores.some(o => o.email.toLowerCase() === email)) {
      toast.error("Este organizador já foi adicionado");
      setOrganizadorEmailInput("");
      return;
    }

    try {
      setIsSearchingOrganizador(true);
      const organizador = await organizadorService.getByEmail(email);
      
      if (organizador) {
        setOrganizadores([...organizadores, organizador]);
        setOrganizadorEmailInput("");
        toast.success("Organizador adicionado com sucesso");
      } else {
        toast.error("Organizador não encontrado com este email");
      }
    } catch (error) {
      console.error("Erro ao buscar organizador:", error);
      toast.error("Erro ao buscar organizador. Tente novamente.");
    } finally {
      setIsSearchingOrganizador(false);
    }
  };

  const handleRemoverAvaliador = (id: number) => {
    setAvaliadores(avaliadores.filter(a => a.id !== id));
  };

  const handleRemoverOrganizador = (id: number) => {
    setOrganizadores(organizadores.filter(o => o.id !== id));
  };

  const handleKeyPressAvaliador = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBuscarAvaliador();
    }
  };

  const handleKeyPressOrganizador = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBuscarOrganizador();
    }
  };

  const handleSubmit = async (values: ComiteCientificoFormValues) => {
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
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Comitê</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Comitê Científico de Tecnologia"
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
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do Comitê</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading || disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIPO_OPCOES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Descreva o comitê, seus objetivos e responsabilidades..."
                  className="min-h-[100px]"
                  disabled={isLoading || disabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Forneça uma descrição detalhada do comitê científico
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seção de Avaliadores */}
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Avaliadores</h3>
            </div>
            <div className="flex items-center gap-2">
              {avaliadores.length >= 3 ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {avaliadores.length} de {Math.max(3, avaliadores.length)} avaliadores
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {avaliadores.length} de 3 avaliadores
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {avaliadores.length < 3 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Faltam {3 - avaliadores.length} avaliador(es)
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Um comitê científico precisa ter pelo menos 3 avaliadores para garantir uma avaliação adequada e imparcial.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Buscar avaliador por email"
                className="pl-9"
                disabled={isLoading || disabled || isSearchingAvaliador}
                value={avaliadorEmailInput}
                onChange={(e) => setAvaliadorEmailInput(e.target.value)}
                onKeyPress={handleKeyPressAvaliador}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleBuscarAvaliador}
              disabled={isLoading || disabled || isSearchingAvaliador || !avaliadorEmailInput.trim()}
            >
              {isSearchingAvaliador ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {avaliadores.length > 0 && (
            <div className="space-y-2">
              <FormDescription>
                Avaliadores adicionados ({avaliadores.length})
              </FormDescription>
              <div className="space-y-2">
                {avaliadores.map((avaliador) => (
                  <div
                    key={avaliador.id}
                    className="flex items-center justify-between border rounded-lg p-3 bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">{avaliador.nome}</p>
                          <p className="text-sm text-muted-foreground">{avaliador.email}</p>
                          {avaliador.instituicao && (
                            <p className="text-xs text-muted-foreground">{avaliador.instituicao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverAvaliador(avaliador.id)}
                      disabled={isLoading || disabled}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seção de Coordenadores (Organizadores) */}
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Coordenadores</h3>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Buscar organizador por email"
                className="pl-9"
                disabled={isLoading || disabled || isSearchingOrganizador}
                value={organizadorEmailInput}
                onChange={(e) => setOrganizadorEmailInput(e.target.value)}
                onKeyPress={handleKeyPressOrganizador}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleBuscarOrganizador}
              disabled={isLoading || disabled || isSearchingOrganizador || !organizadorEmailInput.trim()}
            >
              {isSearchingOrganizador ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {organizadores.length > 0 && (
            <div className="space-y-2">
              <FormDescription>
                Coordenadores adicionados ({organizadores.length})
              </FormDescription>
              <div className="space-y-2">
                {organizadores.map((organizador) => (
                  <div
                    key={organizador.id}
                    className="flex items-center justify-between border rounded-lg p-3 bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">{organizador.nome}</p>
                          <p className="text-sm text-muted-foreground">{organizador.email}</p>
                          {organizador.instituicao && (
                            <p className="text-xs text-muted-foreground">{organizador.instituicao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverOrganizador(organizador.id)}
                      disabled={isLoading || disabled}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            disabled={isLoading || disabled || avaliadores.length < 3}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Comitê"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

