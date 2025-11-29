"use client"

import React from "react";
import Link from "next/link";
import { 
  Calendar,
  ListTree,
  Users,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const functionCards = [
  {
    title: "Eventos",
    description: "Gerencie e acompanhe todos os seus eventos acadêmicos",
    icon: Calendar,
    href: "/painel/organizador/eventos",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    title: "Trilhas",
    description: "Crie e gerencie trilhas e suas trilhas temáticas",
    icon: ListTree,
    href: "/painel/organizador/trilhas",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    title: "Comitês Científicos",
    description: "Gerencie comitês científicos e seus membros",
    icon: Users,
    href: "/painel/organizador/comites",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
];

export default function OrganizadorPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Painel do Organizador
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus eventos, trilhas e comitês científicos
        </p>
      </div>

      {/* Function Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {functionCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card 
                className={`${card.bgColor} ${card.borderColor} border-2 hover:shadow-lg transition-all cursor-pointer h-full`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-3 rounded-lg ${card.bgColor} ${card.color} border ${card.borderColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-between ${card.color} hover:${card.bgColor}`}
                  >
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Welcome Message */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Escolha uma das opções acima para começar a gerenciar seus recursos. 
          Crie eventos, organize trilhas e configure comitês científicos para seus eventos acadêmicos.
        </p>
      </div>
    </div>
  );
}
