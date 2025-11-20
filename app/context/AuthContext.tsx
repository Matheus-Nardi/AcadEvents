"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie";
import { Login } from '@/types/auth/Login';
import { User } from '@/types/auth/User';
import { Autor } from '@/types/auth/Autor';
import { Avaliador } from '@/types/auth/Avaliador';
import { Organizador } from '@/types/auth/Organizador';
import { authService } from '@/lib/services/auth/AuthService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  login: (credentials: Login) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Type guards para identificar o tipo de usuário
const isAutor = (user: User): user is Autor => {
  return 'biografia' in user && 'areaAtuacao' in user && 'lattes' in user;
};

const isAvaliador = (user: User): user is Avaliador => {
  return 'especialidades' in user && 'numeroAvaliacoes' in user && 'disponibilidade' in user;
};

const isOrganizador = (user: User): user is Organizador => {
  return 'cargo' in user && 'permissoes' in user;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userLogged = await authService.profile();
        setUser(userLogged);
      } catch (error) {
        console.log("Sessão não encontrada ou token inválido, deslogando.");
        setUser(null); 
        await authService.logout(); 
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const login = async (credentials: Login) => {
    try {
      const token = await authService.login(credentials);
      Cookies.set('auth_token', token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict'
      });
      
      const userProfile = await authService.profile();
      setUser(userProfile);
      router.push('/painel');
      toast.success(`Bem vindo de volta, ${userProfile.nome}!`);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };
    
  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  const value = { user, loading, logout, login };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

