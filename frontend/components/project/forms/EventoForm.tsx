"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Calendar, 
  MapPin, 
  Globe, 
  Image as ImageIcon, 
  FileText,
} from "lucide-react";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { Trilha } from "@/types/trilha/Trilha";
import { EventoRequest } from "@/types/evento/EventoRequest";
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

const eventoSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome do evento é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  dataInicio: z
    .string()
    .min(1, "Data de início é obrigatória"),
  dataFim: z
    .string()
    .min(1, "Data de fim é obrigatória"),
  local: z
    .string()
    .min(1, "Local é obrigatório"),
  site: z
    .string()
    .url("URL do site inválida")
    .optional()
    .or(z.literal("")),
  logo: z
    .string()
    .url("URL do logo inválida")
    .optional()
    .or(z.literal("")),
  trilhaId: z
    .string()
    .min(1, "Trilha é obrigatória"),
}).refine(
  (data) => {
    const dataInicio = new Date(data.dataInicio);
    const dataFim = new Date(data.dataFim);
    return dataFim >= dataInicio;
  },
  {
    message: "Data de fim deve ser posterior ou igual à data de início",
    path: ["dataFim"],
  }
);

type EventoFormValues = z.infer<typeof eventoSchema>;

interface EventoFormProps {
  onNext: (data: Partial<EventoRequest>) => void;
  initialData?: Partial<EventoFormValues>;
  disabled?: boolean;
}



export default function EventoForm({ 
  onNext,
  initialData,
  disabled = false
}: EventoFormProps) {
  const [trilhas, setTrilhas] = React.useState<Trilha[]>([]);
  const [isLoadingTrilhas, setIsLoadingTrilhas] = React.useState(false);

  const form = useForm<EventoFormValues>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      dataInicio: initialData?.dataInicio || "",
      dataFim: initialData?.dataFim || "",
      local: initialData?.local || "",
      site: initialData?.site || "",
      logo: initialData?.logo || "",
      trilhaId: (() => {
        const id: string | number | undefined = initialData?.trilhaId as any;
        if (typeof id === 'string') return id;
        if (typeof id === 'number') return id.toString();
        return "";
      })(),
    },
  });

  // Carrega todas as trilhas ao montar o componente
  React.useEffect(() => {
    const loadTrilhas = async () => {
      try {
        setIsLoadingTrilhas(true);
        const trilhasData = await trilhaService.getAll();
        setTrilhas(trilhasData);
      } catch (error) {
        console.error("Erro ao carregar trilhas:", error);
      } finally {
        setIsLoadingTrilhas(false);
      }
    };

    loadTrilhas();
  }, []);

  const onSubmit = (values: EventoFormValues) => {
    // Converte trilhaId de string para number (obrigatório)
    const trilhaId = parseInt(values.trilhaId);

    onNext({
      ...values,
      trilhaId,
    } as Partial<EventoRequest>);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Evento</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Congresso Internacional de Tecnologia"
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
                  placeholder="Descreva o evento, seus objetivos e público-alvo..."
                  className="min-h-[100px]"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Forneça uma descrição detalhada do evento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="datetime-local"
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
            name="dataFim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Fim</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="datetime-local"
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
        </div>

        <FormField
          control={form.control}
          name="local"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Centro de Convenções, São Paulo - SP"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="site"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site do Evento (Opcional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://exemplo.com"
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
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Logo (Opcional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/logo.png"
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
        </div>

        <FormField
          control={form.control}
          name="trilhaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trilha</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled || isLoadingTrilhas}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma trilha" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trilhas.map((trilha) => (
                    <SelectItem key={trilha.id} value={trilha.id.toString()}>
                      {trilha.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione uma trilha para associar ao evento. Os autores poderão escolher qualquer trilha temática desta trilha ao fazer suas submissões.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={disabled}
        >
          Próximo: Configuração
        </Button>
      </form>
    </Form>
  );
}
