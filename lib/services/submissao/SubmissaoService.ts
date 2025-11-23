import axios from 'axios';
import Cookies from 'js-cookie';
import { Submissao } from '@/types/submissao/Submissao';
import { SubmissaoRequest } from '@/types/submissao/SubmissaoRequest';

class SubmissaoService {
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

  async getAll(): Promise<Submissao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/submissao`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todas as submissões:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Submissao> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/submissao/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar submissão com ID ${id}:`, error);
      throw error;
    }
  }

  async create(request: SubmissaoRequest): Promise<Submissao> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/submissao`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar submissão:", error);
      throw error;
    }
  }

  async update(id: number, request: SubmissaoRequest): Promise<Submissao> {
    try {
      const response = await axios.put(
        `${this.getApiUrl()}/submissao/${id}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar submissão com ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.getApiUrl()}/submissao/${id}`,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao deletar submissão com ID ${id}:`, error);
      throw error;
    }
  }
}

export const submissaoService = new SubmissaoService();

