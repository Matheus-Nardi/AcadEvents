import axios from 'axios';
import Cookies from 'js-cookie';
import { ConfiguracaoEvento } from '@/types/configuracao-evento/ConfiguracaoEvento';
import { ConfiguracaoEventoRequest } from '@/types/configuracao-evento/ConfiguracaoEventoRequest';

class ConfiguracaoEventoService {
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

  async getAll(): Promise<ConfiguracaoEvento[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/configuracao-evento`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todas as configurações de evento:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<ConfiguracaoEvento> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/configuracaoevento/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar configuração de evento com ID ${id}:`, error);
      throw error;
    }
  }

  async create(request: ConfiguracaoEventoRequest): Promise<ConfiguracaoEvento> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/configuracaoevento`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar configuração de evento:", error);
      throw error;
    }
  }

  async createForEvento(eventoId: number, request: ConfiguracaoEventoRequest): Promise<ConfiguracaoEvento> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/configuracaoevento/evento/${eventoId}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar configuração de evento para evento ${eventoId}:`, error);
      throw error;
    }
  }

  async update(id: number, request: ConfiguracaoEventoRequest): Promise<void> {
    try {
      await axios.put(
        `${this.getApiUrl()}/configuracaoevento/${id}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao atualizar configuração de evento com ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.getApiUrl()}/configuracaoevento/${id}`,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao deletar configuração de evento com ID ${id}:`, error);
      throw error;
    }
  }
}

export const configuracaoEventoService = new ConfiguracaoEventoService();

