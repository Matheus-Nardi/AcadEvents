"use client"

import Image from "next/image"
import Link from "next/link"
import { User, LogOut, Settings } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Autor } from "@/types/auth/Autor"
import { Avaliador } from "@/types/auth/Avaliador"
import { Organizador } from "@/types/auth/Organizador"

// Type guards
const isAutor = (user: any): user is Autor => {
  return user && 'biografia' in user && 'areaAtuacao' in user && 'lattes' in user
}

const isAvaliador = (user: any): user is Avaliador => {
  return user && 'especialidades' in user && 'numeroAvaliacoes' in user && 'disponibilidade' in user
}

const isOrganizador = (user: any): user is Organizador => {
  return user && 'cargo' in user && 'permissoes' in user
}

export default function Header() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const getPainelLink = () => {
    if (!user) return "/login"
    if (isAutor(user)) return "/painel/autor"
    if (isAvaliador(user)) return "/painel/avaliador"
    if (isOrganizador(user)) return "/painel/organizador"
    return "/painel"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger />
        <div className="flex flex-1 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/logo-claro.png"
              alt="Acad Events"
              width={120}
              height={40}
              className="h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logo/logo_escuro.png"
              alt="Acad Events"
              width={120}
              height={40}
              className="hidden h-10 w-auto dark:block"
              priority
            />
          </Link>

          {/* Navigation - apenas links públicos */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/eventos"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Eventos
            </Link>
          </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                  aria-label="Menu do usuário"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getInitials(user.nome, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.nome}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getPainelLink()} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Painel</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  variant="destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">
                <User className="mr-2 h-4 w-4" />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </div>
      </div>
    </header>
  )
}
