"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  FileText,
  Users,
  ListTree,
  LogIn,
  UserPlus,
  Home,
  CheckCircle2,
  LogOut,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Mail,
  Sparkles,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Autor } from "@/types/auth/Autor"
import type { Avaliador } from "@/types/auth/Avaliador"
import type { Organizador } from "@/types/auth/Organizador"
import { cn } from "@/lib/utils"

// Type guards
const isAutor = (user: any): user is Autor => {
  return user && "biografia" in user && "areaAtuacao" in user && "lattes" in user
}

const isAvaliador = (user: any): user is Avaliador => {
  return user && "especialidades" in user && "numeroAvaliacoes" in user && "disponibilidade" in user
}

const isOrganizador = (user: any): user is Organizador => {
  return user && "cargo" in user && "permissoes" in user
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

const getUserRole = (user: any): { label: string; color: string } => {
  if (isOrganizador(user)) return { label: "Organizador", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" }
  if (isAvaliador(user)) return { label: "Avaliador", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" }
  if (isAutor(user)) return { label: "Autor", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" }
  return { label: "Usuário", color: "bg-muted text-muted-foreground" }
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = React.useState<string[]>(["eventos", "submissoes", "avaliacoes"])

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/"
    return pathname?.startsWith(url)
  }

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => (prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]))
  }

  const userRole = user ? getUserRole(user) : null

  return (
    <Sidebar className="border-r border-border/50">
      {/* Header com Logo */}
      <SidebarHeader className="border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 px-2 py-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base tracking-tight">Acad Events</span>
            <span className="text-[10px] text-muted-foreground">Eventos Acadêmicos</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Menu Público (não autenticado) */}
        {!user && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")}>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>Explorar Eventos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="mx-0" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Conta
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/login")}>
                      <Link href="/login">
                        <LogIn className="h-4 w-4" />
                        <span>Entrar</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/cadastro")}>
                      <Link href="/cadastro">
                        <UserPlus className="h-4 w-4" />
                        <span>Criar Conta</span>
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0"
                        >
                          Grátis
                        </Badge>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Menu Autor */}
        {user && isAutor(user) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")}>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>Explorar Eventos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/painel/autor")}>
                      <Link href="/painel/autor">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Meu Painel</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="mx-0" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Submissões
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/"}>
                      <Link href="/" className="group">
                        <PlusCircle className="h-4 w-4 text-primary" />
                        <span>Nova Submissão</span>
                        <Sparkles className="ml-auto h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/painel/autor/submissoes")}>
                      <Link href="/painel/autor">
                        <FileText className="h-4 w-4" />
                        <span>Minhas Submissões</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Menu Avaliador */}
        {user && isAvaliador(user) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")}>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>Explorar Eventos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/painel/avaliador") && pathname === "/painel/avaliador"}
                    >
                      <Link href="/painel/avaliador">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Meu Painel</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="mx-0" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Avaliações
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/painel/avaliador/convites")}>
                      <Link href="/painel/avaliador/convites">
                        <Mail className="h-4 w-4" />
                        <span>Convites</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/painel/avaliador/submissoes")}>
                      <Link href="/painel/avaliador/submissoes">
                        <ClipboardList className="h-4 w-4" />
                        <span>Pendentes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/painel/avaliador/historico")}>
                      <Link href="/painel/avaliador">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Concluídas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Menu Organizador */}
        {user && isOrganizador(user) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")}>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>Explorar Eventos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/painel/organizador") && pathname === "/painel/organizador"}
                    >
                      <Link href="/painel/organizador">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="mx-0" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Gestão
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Eventos - Collapsible */}
                  <Collapsible open={openMenus.includes("eventos")} onOpenChange={() => toggleMenu("eventos")}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full">
                          <Calendar className="h-4 w-4" />
                          <span>Eventos</span>
                          <ChevronRight
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform duration-200",
                              openMenus.includes("eventos") && "rotate-90",
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/painel/organizador/eventos")}>
                              <Link href="/painel/organizador/eventos">Todos os Eventos</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/painel/organizador/criar-evento")}>
                              <Link href="/painel/organizador/criar-evento" className="text-primary">
                                <PlusCircle className="h-3 w-3 mr-1" />
                                Criar Evento
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  {/* Trilhas - Collapsible */}
                  <Collapsible open={openMenus.includes("trilhas")} onOpenChange={() => toggleMenu("trilhas")}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full">
                          <ListTree className="h-4 w-4" />
                          <span>Trilhas</span>
                          <ChevronRight
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform duration-200",
                              openMenus.includes("trilhas") && "rotate-90",
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/painel/organizador/trilhas")}>
                              <Link href="/painel/organizador/trilhas">Todas as Trilhas</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/painel/organizador/criar-trilha")}>
                              <Link href="/painel/organizador/criar-trilha" className="text-primary">
                                <PlusCircle className="h-3 w-3 mr-1" />
                                Criar Trilha
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  {/* Comitês */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/painel/organizador/comites")}>
                      <Link href="/painel/organizador/comites">
                        <Users className="h-4 w-4" />
                        <span>Comitês Científicos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer com usuário */}
      {user && (
        <SidebarFooter className="border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent transition-colors">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(user.nome, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">{user.nome}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
                {userRole && (
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0 text-[10px] px-1.5 py-0 h-5 border-0", userRole.color)}
                  >
                    {userRole.label}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.nome}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
