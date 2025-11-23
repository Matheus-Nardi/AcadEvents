import axios from 'axios';
import Cookies from 'js-cookie';
import { Referencia } from '@/types/referencia/Referencia';

class ReferenciaService {
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

  async createFromDoi(
    submissaoId: number,
    doi: string
  ): Promise<Referencia> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/referencia/submissao/${submissaoId}/doi`,
        {},
        {
          headers: this.getAuthHeaders(),
          params: { doi }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar referência a partir do DOI ${doi} para submissão ${submissaoId}:`, error);
      throw error;
    }
  }

  async getBySubmissao(submissaoId: number): Promise<Referencia[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/referencia/submissao/${submissaoId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar referências da submissão ${submissaoId}:`, error);
      throw error;
    }
  }

  async getById(id: number): Promise<Referencia> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/referencia/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar referência com ID ${id}:`, error);
      throw error;
    }
  }
}

export const referenciaService = new ReferenciaService();

