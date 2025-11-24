import axios from 'axios';
import Cookies from 'js-cookie';
import { Avaliador } from '@/types/auth/Avaliador';
import { AvaliadorRequest } from '@/types/auth/AvaliadorRequest';

class AvaliadorService {
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

  async getByEmail(email: string): Promise<Avaliador | null> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliador/email/${encodeURIComponent(email)}`,
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
      console.error(`Erro ao buscar avaliador com email ${email}:`, error);
      throw error;
    }
  }

  async create(request: AvaliadorRequest): Promise<Avaliador> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/avaliador`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 400) {
        throw new Error(error.response.data || 'Erro ao criar avaliador');
      }
      console.error('Erro ao criar avaliador:', error);
      throw error;
    }
  }
}

export const avaliadorService = new AvaliadorService();

