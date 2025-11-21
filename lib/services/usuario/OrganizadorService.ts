import axios from 'axios';
import Cookies from 'js-cookie';
import { Organizador } from '@/types/auth/Organizador';

class OrganizadorService {
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

  private getAuthHeaders() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Token não encontrado');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getByEmail(email: string): Promise<Organizador | null> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/organizador/email/${encodeURIComponent(email)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      console.error(`Erro ao buscar organizador com email ${email}:`, error);
      throw error;
    }
  }
}

export const organizadorService = new OrganizadorService();

