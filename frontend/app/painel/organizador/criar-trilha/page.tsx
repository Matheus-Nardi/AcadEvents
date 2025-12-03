"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TrilhaForm from "@/components/project/forms/TrilhaForm";
import TrilhasTematicasForm from "@/components/project/forms/TrilhasTematicasForm";
import { trilhaService } from "@/lib/services/trilha/TrilhaService";
import { trilhaTematicaService } from "@/lib/services/trilha-tematica/TrilhaTematicaService";
import { toast } from "sonner";
import { TrilhaRequest } from "@/types/trilha/TrilhaRequest";
import { TrilhaTematicaRequest } from "@/types/trilha-tematica/TrilhaTematicaRequest";

type Step = 1 | 2;

export default function CriarTrilhaPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [trilhaData, setTrilhaData] = React.useState<Partial<TrilhaRequest> | null>(null);
  const [trilhaId, setTrilhaId] = React.useState<number | null>(null);

  const progress = step === 1 ? 50 : 100;

  const handleTrilhaNext = (data: Partial<TrilhaRequest>) => {
    setTrilhaData(data);
    setStep(2);
  };

  const handleTrilhasTematicasBack = () => {
    setStep(1);
  };

  const handleTrilhasTematicasSubmit = async (trilhasTematicas: TrilhaTematicaRequest[]) => {
    try {
      if (!trilhaData) {
        toast.error("Dados da trilha não encontrados");
        return;
      }

      // Primeiro, cria a trilha
      const trilha = await trilhaService.create({
        nome: trilhaData.nome!,
        descricao: trilhaData.descricao!,
        coordenador: trilhaData.coordenador!,
      } as TrilhaRequest);
      
      setTrilhaId(trilha.id);

      // Depois, cria e associa cada trilha temática
      for (const trilhaTematicaData of trilhasTematicas) {
        // Cria a trilha temática
        const trilhaTematica = await trilhaTematicaService.create(trilhaTematicaData);
        
        // Associa à trilha
        await trilhaTematicaService.associateToTrilha(trilhaTematica.id, trilha.id);
      }

      toast.success("Trilha e trilhas temáticas criadas com sucesso!");
      router.push("/painel/organizador");
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        "Erro ao criar trilha e trilhas temáticas. Tente novamente.";
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
            Criar Nova Trilha
          </h1>
          <p className="text-muted-foreground">
            Preencha as informações abaixo para criar sua trilha e trilhas temáticas
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
                Informações da Trilha
              </span>
            </div>
            
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted"
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                Trilhas Temáticas
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Container */}
        <div className="bg-card border rounded-lg shadow-sm p-6 sm:p-8">
          {step === 1 ? (
            <div>
              <h2 className="text-xl font-semibold mb-6">Informações Básicas da Trilha</h2>
              <TrilhaForm 
                onNext={handleTrilhaNext}
                initialData={trilhaData || undefined}
              />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-6">Adicionar Trilhas Temáticas</h2>
              <TrilhasTematicasForm
                onBack={handleTrilhasTematicasBack}
                onSubmit={handleTrilhasTematicasSubmit}
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
