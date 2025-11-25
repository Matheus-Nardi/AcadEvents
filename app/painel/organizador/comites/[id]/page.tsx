"use client"

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  Loader2,
  Users,
  Briefcase,
  FileText,
  Tag,
  AlertCircle,
  Calendar,
  Hash,
  Building2,
  Mail,
  MapPin,
  Plus,
  Search,
  UserCheck
} from "lucide-react";
import { comiteCientificoService } from "@/lib/services/comite-cientifico/ComiteCientificoService";
import { avaliadorService } from "@/lib/services/usuario/AvaliadorService";
import { organizadorService } from "@/lib/services/usuario/OrganizadorService";
import { ComiteCientifico } from "@/types/comite-cientifico/ComiteCientifico";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const getTipoBadge = (tipo: string) => {
  const tipoConfig: Record<string, { label: string; className: string }> = {
    Cientifico: {
      label: "Científico",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    Organizacao: {
      label: "Organização",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    Revisao: {
      label: "Revisão",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
  };

  const config = tipoConfig[tipo] || {
    label: tipo,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function ComiteCientificoDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const comiteId = Number(params.id);
  
  const [comite, setComite] = React.useState<ComiteCientifico | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"avaliador" | "coordenador">("avaliador");
  const [emailInput, setEmailInput] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    const fetchComite = async () => {
      if (!comiteId || isNaN(comiteId)) {
        toast.error("ID do comitê científico inválido");
        router.push("/painel/organizador/comites");
        return;
      }

      try {
        setLoading(true);
        const data = await comiteCientificoService.getById(comiteId);
        setComite(data);
      } catch (error: any) {
        console.error("Erro ao buscar comitê científico:", error);
        const errorMessage = 
          error?.response?.data?.message || 
          "Erro ao carregar comitê científico. Tente novamente.";
        toast.error(errorMessage);
        router.push("/painel/organizador/comites");
      } finally {
        setLoading(false);
      }
    };

    fetchComite();
  }, [comiteId, router]);

  const fetchComiteData = async () => {
    try {
      const data = await comiteCientificoService.getById(comiteId);
      setComite(data);
    } catch (error: any) {
      console.error("Erro ao buscar comitê científico:", error);
      throw error;
    }
  };

  const handleBuscarEAdicionar = async () => {
    if (!emailInput.trim()) {
      toast.error("Digite um email para buscar");
      return;
    }

    const email = emailInput.trim().toLowerCase();

    // Verifica se já está no comitê
    if (activeTab === "avaliador") {
      const jaExiste = comite?.avaliadores?.some(a => a.email.toLowerCase() === email);
      if (jaExiste) {
        toast.error("Este avaliador já está no comitê");
        setEmailInput("");
        return;
      }
    } else {
      const jaExiste = comite?.coordenadores?.some(c => c.email.toLowerCase() === email);
      if (jaExiste) {
        toast.error("Este coordenador já está no comitê");
        setEmailInput("");
        return;
      }
    }

    try {
      setIsSearching(true);
      
      if (activeTab === "avaliador") {
        // Busca o avaliador primeiro para validar
        const avaliador = await avaliadorService.getByEmail(email);
        if (!avaliador) {
          toast.error("Avaliador não encontrado com este email");
          return;
        }

        // Adiciona ao comitê
        setIsAdding(true);
        await comiteCientificoService.addAvaliador(comiteId, email);
        toast.success("Avaliador adicionado com sucesso!");
      } else {
        // Busca o organizador primeiro para validar
        const organizador = await organizadorService.getByEmail(email);
        if (!organizador) {
          toast.error("Organizador não encontrado com este email");
          return;
        }

        // Adiciona ao comitê
        setIsAdding(true);
        await comiteCientificoService.addCoordenador(comiteId, email);
        toast.success("Coordenador adicionado com sucesso!");
      }

      // Atualiza os dados do comitê
      await fetchComiteData();
      setEmailInput("");
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao adicionar membro:", error);
      const errorMessage = 
        error?.response?.data?.message || 
        "Erro ao adicionar membro. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBuscarEAdicionar();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!comite) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comitê científico não encontrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              O comitê científico que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => router.push("/painel/organizador/comites")}>
              Voltar para Comitês
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/painel/organizador/comites")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {comite.nome}
                </h1>
                <div className="flex items-center gap-2">
                  {getTipoBadge(comite.tipo)}
                </div>
              </div>
            </div>
            {comite.descricao && (
              <p className="text-muted-foreground text-lg">
                {comite.descricao}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Botão de Adicionar Membro */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setActiveTab("avaliador");
                setEmailInput("");
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">ID do Comitê</p>
                    <p className="font-medium">#{comite.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                    <div className="mt-1">
                      {getTipoBadge(comite.tipo)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">ID do Evento</p>
                    <p className="font-medium">#{comite.eventoId}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avaliadores */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Avaliadores ({comite.avaliadores?.length || 0})
                  </CardTitle>
                  <CardDescription>
                    Avaliadores que fazem parte deste comitê científico
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveTab("avaliador");
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {comite.avaliadores && comite.avaliadores.length > 0 ? (
                <div className="space-y-3">
                  {comite.avaliadores.map((avaliador) => (
                    <div 
                      key={avaliador.id} 
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{avaliador.nome}</p>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{avaliador.email}</span>
                          </div>
                          {avaliador.instituicao && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{avaliador.instituicao}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum avaliador associado a este comitê</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coordenadores */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Coordenadores ({comite.coordenadores?.length || 0})
                  </CardTitle>
                  <CardDescription>
                    Coordenadores responsáveis por este comitê científico
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveTab("coordenador");
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {comite.coordenadores && comite.coordenadores.length > 0 ? (
                <div className="space-y-3">
                  {comite.coordenadores.map((coordenador) => (
                    <div 
                      key={coordenador.id} 
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-semibold shrink-0">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{coordenador.nome}</p>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{coordenador.email}</span>
                          </div>
                          {coordenador.instituicao && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{coordenador.instituicao}</span>
                            </div>
                          )}
                          {coordenador.cargo && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {coordenador.cargo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum coordenador associado a este comitê</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Avaliadores</span>
                  </div>
                  <span className="text-lg font-bold">
                    {comite.avaliadores?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Coordenadores</span>
                  </div>
                  <span className="text-lg font-bold">
                    {comite.coordenadores?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total de Membros</span>
                  </div>
                  <span className="text-lg font-bold">
                    {(comite.avaliadores?.length || 0) + (comite.coordenadores?.length || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Modal de Adicionar Membro */}
      <Dialog 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEmailInput("");
            setIsSearching(false);
            setIsAdding(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Membro ao Comitê</DialogTitle>
            <DialogDescription>
              Busque e adicione um avaliador ou coordenador ao comitê científico
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "avaliador" | "coordenador")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avaliador">
                <Users className="h-4 w-4 mr-2" />
                Avaliador
              </TabsTrigger>
              <TabsTrigger value="coordenador">
                <Briefcase className="h-4 w-4 mr-2" />
                Coordenador
              </TabsTrigger>
            </TabsList>

            <TabsContent value="avaliador" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email do Avaliador
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="exemplo@email.com"
                      className="pl-9"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSearching || isAdding}
                    />
                  </div>
                  <Button
                    onClick={handleBuscarEAdicionar}
                    disabled={isSearching || isAdding || !emailInput.trim()}
                  >
                    {isSearching || isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar e Adicionar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite o email do avaliador para buscar e adicionar ao comitê
                </p>
              </div>
            </TabsContent>

            <TabsContent value="coordenador" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email do Coordenador
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="exemplo@email.com"
                      className="pl-9"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSearching || isAdding}
                    />
                  </div>
                  <Button
                    onClick={handleBuscarEAdicionar}
                    disabled={isSearching || isAdding || !emailInput.trim()}
                  >
                    {isSearching || isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar e Adicionar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite o email do coordenador para buscar e adicionar ao comitê
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

