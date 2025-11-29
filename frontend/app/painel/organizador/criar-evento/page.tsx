"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import EventoForm from "@/components/project/forms/EventoForm";
import ConfiguracaoEventoForm from "@/components/project/forms/ConfiguracaoEventoForm";
import ComiteCientificoForm from "@/components/project/forms/ComiteCientificoForm";
import { eventoService } from "@/lib/services/evento/EventoService";
import { configuracaoEventoService } from "@/lib/services/configuracao-evento/ConfiguracaoEventoService";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { comiteCientificoService } from "@/lib/services/comite-cientifico/ComiteCientificoService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EventoRequest } from "@/types/evento/EventoRequest";
import { ConfiguracaoEventoRequest } from "@/types/configuracao-evento/ConfiguracaoEventoRequest";
import { ComiteCientificoRequest } from "@/types/comite-cientifico/ComiteCientificoRequest";

type Step = 1 | 2 | 3;

export default function CriarEventoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = React.useState<Step>(1);
  const [eventoData, setEventoData] = React.useState<Partial<EventoRequest> | null>(null);
  const [configuracaoId, setConfiguracaoId] = React.useState<number | null>(null);
  const [eventoId, setEventoId] = React.useState<number | null>(null);

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleEventoNext = (data: Partial<EventoRequest>) => {
    setEventoData(data);
    setStep(2);
  };

  const handleConfiguracaoBack = () => {
    setStep(1);
  };

  const handleConfiguracaoSubmit = async (configData: ConfiguracaoEventoRequest) => {
    try {
      // Primeiro, cria a configuração
      const configuracao = await configuracaoEventoService.create(configData);
      setConfiguracaoId(configuracao.id);

      // Depois, cria o evento com a configuração
      if (!eventoData) {
        toast.error("Dados do evento não encontrados");
        return;
      }

      // Converte trilhaId e trilhaTematicaId de string para number (obrigatórios)
      const trilhaId = typeof eventoData.trilhaId === 'string' 
        ? parseInt(eventoData.trilhaId) 
        : eventoData.trilhaId!;
      const trilhaTematicaId = typeof eventoData.trilhaTematicaId === 'string'
        ? parseInt(eventoData.trilhaTematicaId)
        : eventoData.trilhaTematicaId!;

      // Cria o evento (organizadorId é extraído do token JWT)
      const evento = await eventoService.create({
        ...eventoData,
        configuracaoEventoId: configuracao.id,
        site: eventoData.site || "",
        logo: eventoData.logo || "",
        trilhaId: trilhaId,
        trilhaTematicaId: trilhaTematicaId,
      } as EventoRequest);

      // Associa a trilha ao evento
      await trilhaService.associateToEvento(trilhaId, evento.id);

      setEventoId(evento.id);
      toast.success("Evento criado com sucesso! Agora configure o comitê científico.");
      setStep(3);
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        "Erro ao criar evento. Tente novamente.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleComiteBack = () => {
    setStep(2);
  };

  const handleComiteSubmit = async (comiteData: ComiteCientificoRequest) => {
    try {
      if (!eventoId) {
        toast.error("ID do evento não encontrado");
        return;
      }

      // Cria o comitê científico (organizadorId é extraído do token JWT)
      await comiteCientificoService.create(eventoId, comiteData);

      toast.success("Comitê científico criado com sucesso!");
      router.push("/painel/organizador");
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        "Erro ao criar comitê científico. Tente novamente.";
      toast.error(errorMessage);
      throw error;
    }
  };  

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Criar Novo Evento
          </h1>
          <p className="text-muted-foreground">
            Preencha as informações abaixo para criar seu evento acadêmico
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted"
              }`}>
                {step > 1 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">1</span>
                )}
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                Informações do Evento
              </span>
            </div>
            
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted"
              }`}>
                {step > 2 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">2</span>
                )}
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                Configuração
              </span>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground" />

            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 3 ? "bg-primary text-primary-foreground border-primary" : "border-muted"
              }`}>
                <span className="text-sm font-medium">3</span>
              </div>
              <span className={`text-sm font-medium ${step >= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                Comitê Científico
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Container */}
        <div className="bg-card border rounded-lg shadow-sm p-6 sm:p-8">
          {step === 1 ? (
            <div>
              <h2 className="text-xl font-semibold mb-6">Informações Básicas do Evento</h2>
              <EventoForm 
                onNext={handleEventoNext}
                initialData={
                  eventoData 
                    ? {
                        ...eventoData,
                        trilhaId: eventoData.trilhaId?.toString() || "",
                        trilhaTematicaId: eventoData.trilhaTematicaId?.toString() || "",
                      }
                    : undefined
                }
              />
            </div>
          ) : step === 2 ? (
            <div>
              <h2 className="text-xl font-semibold mb-6">Configuração do Evento</h2>
              <ConfiguracaoEventoForm
                onBack={handleConfiguracaoBack}
                onSubmit={handleConfiguracaoSubmit}
              />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-6">Comitê Científico</h2>
              <ComiteCientificoForm
                onBack={handleComiteBack}
                onSubmit={handleComiteSubmit}
              />
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Você pode voltar e editar as informações a qualquer momento antes de finalizar
          </p>
        </div>
      </div>
    </div>
  );
}

