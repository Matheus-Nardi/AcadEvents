import axios from 'axios';
import Cookies from 'js-cookie';
import { Autor } from '@/types/auth/Autor';
import { AutorRequest } from '@/types/auth/AutorRequest';

class AutorService {
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

  async create(request: AutorRequest): Promise<Autor> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/autor`,
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
        throw new Error(error.response.data || 'Erro ao criar autor');
      }
      console.error('Erro ao criar autor:', error);
      throw error;
    }
  }
}

export const autorService = new AutorService();

