import axios from 'axios';
import Cookies from 'js-cookie';
import { TrilhaTematica } from '@/types/trilha-tematica/TrilhaTematica';
import { TrilhaTematicaRequest } from '@/types/trilha-tematica/TrilhaTematicaRequest';

class TrilhaTematicaService {
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

  async getAll(): Promise<TrilhaTematica[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/trilha-tematica`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todas as trilhas temáticas:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<TrilhaTematica> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/trilha-tematica/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar trilha temática com ID ${id}:`, error);
      throw error;
    }
  }

  async getByTrilhaId(trilhaId: number): Promise<TrilhaTematica[]> {
    try {
      const allTrilhasTematicas = await this.getAll();
      return allTrilhasTematicas.filter(tt => tt.trilhaId === trilhaId);
    } catch (error) {
      console.error(`Erro ao buscar trilhas temáticas da trilha ${trilhaId}:`, error);
      throw error;
    }
  }

  async createForTrilha(trilhaId: number, request: TrilhaTematicaRequest): Promise<TrilhaTematica> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/trilha-tematica/trilha/${trilhaId}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar trilha temática para trilha ${trilhaId}:`, error);
      throw error;
    }
  }

  async update(id: number, request: TrilhaTematicaRequest): Promise<void> {
    try {
      await axios.put(
        `${this.getApiUrl()}/trilha-tematica/${id}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao atualizar trilha temática com ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.getApiUrl()}/trilha-tematica/${id}`,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao deletar trilha temática com ID ${id}:`, error);
      throw error;
    }
  }
}

export const trilhaTematicaService = new TrilhaTematicaService();

