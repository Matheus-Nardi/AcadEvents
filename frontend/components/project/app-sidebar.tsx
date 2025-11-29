"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Calendar,
  FileText,
  Users,
  ListTree,
  LogIn,
  UserPlus,
  Home,
  CheckCircle2,
  Clock,
  Upload,
  Settings,
  User,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

// Menu items para usuário não autenticado
const publicMenuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Login",
    url: "/login",
    icon: LogIn,
  },
  {
    title: "Cadastro",
    url: "/cadastro",
    icon: UserPlus,
  },
]

// Menu items para Autor
const autorMenuItems = [
  {
    title: "Minhas Submissões",
    url: "/painel/autor",
    icon: FileText,
  },
  {
    title: "Nova Submissão",
    url: "/",
    icon: Upload,
  },
]

// Menu items para Avaliador
const avaliadorMenuItems = [
  {
    title: "Histórico de Convites",
    url: "/painel/avaliador/convites",
    icon: Clock,
  },
  {
    title: "Submissões para Avaliar",
    url: "/painel/avaliador/submissoes",
    icon: FileText,
  },
  {
    title: "Minhas Avaliações",
    url: "/painel/avaliador",
    icon: CheckCircle2,
  },
]

// Menu items para Organizador
const organizadorMenuItems = [
  {
    title: "Painel",
    url: "/painel/organizador",
    icon: Home,
  },
  {
    title: "Eventos",
    url: "/painel/organizador/eventos",
    icon: Calendar,
  },
  {
    title: "Criar Evento",
    url: "/painel/organizador/criar-evento",
    icon: Calendar,
  },
  {
    title: "Trilhas",
    url: "/painel/organizador/trilhas",
    icon: ListTree,
  },
  {
    title: "Criar Trilha",
    url: "/painel/organizador/criar-trilha",
    icon: ListTree,
  },
  {
    title: "Comitês Científicos",
    url: "/painel/organizador/comites",
    icon: Users,
  },
]

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const getMenuItems = () => {
    if (!user) {
      return publicMenuItems
    }

    if (isAutor(user)) {
      return autorMenuItems
    }

    if (isAvaliador(user)) {
      return avaliadorMenuItems
    }

    if (isOrganizador(user)) {
      return organizadorMenuItems
    }

    return publicMenuItems
  }

  const menuItems = getMenuItems()

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(url)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold text-lg">Acad Events</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <SidebarSeparator />
          <div className="px-2 py-2 space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user.nome, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

