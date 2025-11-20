"use client"

import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
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

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/eventos"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Eventos
          </Link>
          <Link
            href="/criar-evento"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Criar Evento
          </Link>
          <Link
            href="/sobre"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Sobre
          </Link>
          <Link
            href="/contato"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Contato
          </Link>
        </nav>

        {/* Theme Toggle */}
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
