import Link from "next/link"
import { LoginForm } from "@/components/project/forms/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <img
              src="/ilustrations/undraw_friendly-guy-avatar_ibbp.svg"
              alt="Ilustração de login"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Bem-vindo de volta!
            </h2>
            <p className="text-muted-foreground text-lg">
              Entre na sua conta para continuar aproveitando os eventos acadêmicos
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>
            <p className="text-muted-foreground">
              Digite suas credenciais para acessar sua conta
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-card border rounded-lg p-6 sm:p-8 shadow-sm">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link
                href="/cadastro"
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
