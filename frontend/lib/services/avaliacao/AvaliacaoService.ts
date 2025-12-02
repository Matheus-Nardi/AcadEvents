import axios from 'axios';
import Cookies from 'js-cookie';
import { Avaliacao } from '@/types/avaliacao/Avaliacao';
import { AvaliacaoRequest } from '@/types/avaliacao/AvaliacaoRequest';
import { ConviteAvaliacao } from '@/types/avaliacao/ConviteAvaliacao';
import { RecusarConviteRequest } from '@/types/avaliacao/RecusarConviteRequest';
import { recomendacaoAvaliacaoToSnakeCase } from '@/lib/utils/enumToCamelCase';

class AvaliacaoService {
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

  async getById(id: number): Promise<Avaliacao> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliação com ID ${id}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<Avaliacao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todas as avaliações:", error);
      throw error;
    }
  }

  async create(request: AvaliacaoRequest): Promise<Avaliacao> {
    try {
      // Converter enum para UPPER_SNAKE_CASE (com underscore) antes de enviar
      const requestBody = {
        ...request,
        recomendacaoEnum: recomendacaoAvaliacaoToSnakeCase(request.recomendacaoEnum),
      };
      
      const response = await axios.post(
        `${this.getApiUrl()}/avaliacao`,
        requestBody,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
      throw error;
    }
  }

  async getByAvaliadorId(avaliadorId: number): Promise<Avaliacao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/avaliador/${avaliadorId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações do avaliador ${avaliadorId}:`, error);
      throw error;
    }
  }

  async getMinhasAvaliacoes(): Promise<Avaliacao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/minhas-avaliacoes`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar minhas avaliações:", error);
      throw error;
    }
  }

  async getMeusConvites(): Promise<ConviteAvaliacao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/convites`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar meus convites:", error);
      throw error;
    }
  }

  async getMeusConvitesComFiltro(status: string = 'Todos'): Promise<ConviteAvaliacao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/meus-convites/filtro`,
        {
          params: {
            status: status
          },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar meus convites com filtro ${status}:`, error);
      throw error;
    }
  }

  async aceitarConvite(conviteId: number): Promise<ConviteAvaliacao> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/avaliacao/convites/${conviteId}/aceitar`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao aceitar convite ${conviteId}:`, error);
      throw error;
    }
  }

  async recusarConvite(conviteId: number, request: RecusarConviteRequest): Promise<ConviteAvaliacao> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/avaliacao/convites/${conviteId}/recusar`,
        request,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao recusar convite ${conviteId}:`, error);
      throw error;
    }
  }

  async getMinhasAvaliacoesCriadas(): Promise<Avaliacao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/minhas`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar minhas avaliações criadas:", error);
      throw error;
    }
  }

  async getAvaliacoesPorSubmissao(submissaoId: number): Promise<Avaliacao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/submissao/${submissaoId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações da submissão ${submissaoId}:`, error);
      throw error;
    }
  }

  async getMinhaAvaliacaoPorSubmissao(submissaoId: number): Promise<Avaliacao | null> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/avaliacao/minha-avaliacao/${submissaoId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Avaliação não encontrada, retornar null
        return null;
      }
      console.error(`Erro ao buscar minha avaliação da submissão ${submissaoId}:`, error);
      throw error;
    }
  }
}

export const avaliacaoService = new AvaliacaoService();

