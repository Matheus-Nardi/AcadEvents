import axios from 'axios';
import Cookies from 'js-cookie';
import { Login } from '@/types/auth/Login';
import { User } from '@/types/auth/User';

class AuthService {
  private getApiUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL não está definida nas variáveis de ambiente');
    }
    return apiUrl;
  }

  private getToken(): string | null {
    return Cookies.get('auth_token') || null;
  }

  async login(login: Login): Promise<string> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/auth/login`,
        login,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      let token = response.data.token;
      return token;
    } catch (error) {
      console.error("Erro ao fazer login no serviço:", error);
      throw error;
    }
  }

  async profile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Token não encontrado');
    }
    return this.me(token);
  }

  async me(token: string): Promise<User> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    Cookies.remove('auth_token');
  }
}

export const authService = new AuthService();

