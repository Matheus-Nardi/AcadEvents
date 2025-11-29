import axios from 'axios';
import Cookies from 'js-cookie';
import { Trilha } from '@/types/trilha/Trilha';
import { TrilhaRequest } from '@/types/trilha/TrilhaRequest';
import { TrilhaTematica } from '@/types/trilha-tematica/TrilhaTematica';

class TrilhaService {
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

  async getAll(): Promise<Trilha[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/trilha`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todas as trilhas:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Trilha> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/trilha/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar trilha com ID ${id}:`, error);
      throw error;
    }
  }

  async create(request: TrilhaRequest): Promise<Trilha> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/trilha`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar trilha:", error);
      throw error;
    }
  }

  async associateToEvento(trilhaId: number, eventoId: number): Promise<Trilha> {
    try {
      const response = await axios.patch(
        `${this.getApiUrl()}/trilha/${trilhaId}/evento/${eventoId}`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao associar trilha ${trilhaId} ao evento ${eventoId}:`, error);
      throw error;
    }
  }

  async update(id: number, request: TrilhaRequest): Promise<void> {
    try {
      await axios.put(
        `${this.getApiUrl()}/trilha/${id}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao atualizar trilha com ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.getApiUrl()}/trilha/${id}`,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao deletar trilha com ID ${id}:`, error);
      throw error;
    }
  }

  async getByTrilhaId(trilhaId: number): Promise<TrilhaTematica[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/trilha/${trilhaId}/tematicas`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar trilhas temáticas da trilha ${trilhaId}:`, error);
      throw error;
    }
  }
}

export const trilhaService = new TrilhaService();

