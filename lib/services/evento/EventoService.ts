import axios from 'axios';
import Cookies from 'js-cookie';
import { Evento } from '@/types/evento/Evento';
import { EventoRequest } from '@/types/evento/EventoRequest';

class EventoService {
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

  async getAll(): Promise<Evento[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/evento/all`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todos os eventos:", error);
      throw error;
    }
  }

  async getMeusEventos(): Promise<Evento[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/evento/meus-eventos`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar meus eventos:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Evento> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/evento/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evento com ID ${id}:`, error);
      throw error;
    }
  }

  async create(eventoRequest: EventoRequest): Promise<Evento> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/evento`,
        eventoRequest,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw error;
    }
  }
}

export const eventoService = new EventoService();

