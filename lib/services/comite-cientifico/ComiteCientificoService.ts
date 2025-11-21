import axios from 'axios';
import Cookies from 'js-cookie';
import { ComiteCientifico } from '@/types/comite-cientifico/ComiteCientifico';
import { ComiteCientificoRequest } from '@/types/comite-cientifico/ComiteCientificoRequest';

class ComiteCientificoService {
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

  async getAll(): Promise<ComiteCientifico[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/comitecientifico`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todos os comitês científicos:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<ComiteCientifico> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/comitecientifico/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar comitê científico com ID ${id}:`, error);
      throw error;
    }
  }

  async create(eventoId: number, request: ComiteCientificoRequest): Promise<ComiteCientifico> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/comitecientifico/evento/${eventoId}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar comitê científico para evento ${eventoId}:`, error);
      throw error;
    }
  }

  async update(id: number, request: ComiteCientificoRequest): Promise<void> {
    try {
      await axios.put(
        `${this.getApiUrl()}/comitecientifico/${id}`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao atualizar comitê científico com ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.getApiUrl()}/comitecientifico/${id}`,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error(`Erro ao deletar comitê científico com ID ${id}:`, error);
      throw error;
    }
  }

  async addAvaliador(comiteId: number, avaliadorId: number): Promise<ComiteCientifico> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/comitecientifico/${comiteId}/avaliadores/${avaliadorId}`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar avaliador ${avaliadorId} ao comitê ${comiteId}:`, error);
      throw error;
    }
  }

  async removeAvaliador(comiteId: number, avaliadorId: number): Promise<ComiteCientifico> {
    try {
      const response = await axios.delete(
        `${this.getApiUrl()}/comitecientifico/${comiteId}/avaliadores/${avaliadorId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao remover avaliador ${avaliadorId} do comitê ${comiteId}:`, error);
      throw error;
    }
  }

  async addCoordenador(comiteId: number, organizadorId: number): Promise<ComiteCientifico> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/comitecientifico/${comiteId}/coordenadores/${organizadorId}`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar coordenador ${organizadorId} ao comitê ${comiteId}:`, error);
      throw error;
    }
  }

  async removeCoordenador(comiteId: number, organizadorId: number): Promise<ComiteCientifico> {
    try {
      const response = await axios.delete(
        `${this.getApiUrl()}/comitecientifico/${comiteId}/coordenadores/${organizadorId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao remover coordenador ${organizadorId} do comitê ${comiteId}:`, error);
      throw error;
    }
  }
}

export const comiteCientificoService = new ComiteCientificoService();

