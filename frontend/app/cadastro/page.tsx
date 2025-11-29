import Link from "next/link"
import { AutorForm } from "@/components/project/forms/AutorForm"
import { AvaliadorForm } from "@/components/project/forms/AvaliadorForm"
import { OrganizadorForm } from "@/components/project/forms/OrganizadorForm"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <img
              src="/ilustrations/undraw_friendly-guy-avatar_dqp5.svg"
              alt="Ilustração de cadastro"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Junte-se a nós!
            </h2>
            <p className="text-muted-foreground text-lg">
              Crie sua conta e comece a participar de eventos acadêmicos incríveis
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
            <p className="text-muted-foreground">
              Escolha o tipo de perfil e preencha seus dados
            </p>
          </div>

          {/* Registration Form with Tabs */}
          <div className="bg-card border rounded-lg p-6 sm:p-8 shadow-sm">
            <Tabs defaultValue="autor" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="autor">Autor</TabsTrigger>
                <TabsTrigger value="avaliador">Avaliador</TabsTrigger>
                <TabsTrigger value="organizador">Organizador</TabsTrigger>
              </TabsList>
              
              <TabsContent value="autor" className="mt-0">
                <AutorForm />
              </TabsContent>
              
              <TabsContent value="avaliador" className="mt-0">
                <AvaliadorForm />
              </TabsContent>
              
              <TabsContent value="organizador" className="mt-0">
                <OrganizadorForm />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

