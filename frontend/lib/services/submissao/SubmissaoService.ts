import axios from 'axios';
import Cookies from 'js-cookie';
import { Submissao } from '@/types/submissao/Submissao';
import { SubmissaoRequest } from '@/types/submissao/SubmissaoRequest';
import { SubmissaoRequestApi } from '@/types/submissao/SubmissaoRequestApi';
import { SubmissaoCreateCompleteResult } from '@/types/submissao/SubmissaoCreateCompleteResult';
import { DecidirStatusRevisaoRequest } from '@/types/submissao/DecidirStatusRevisaoRequest';
import { VerificarSubmissaoAutor } from '@/types/submissao/VerificarSubmissaoAutor';
import { 
  statusSubmissaoToCamelCase, 
  formatoSubmissaoToCamelCase,
  camelCaseToStatusSubmissao,
  camelCaseToFormatoSubmissao
} from '@/lib/utils/enumToCamelCase';

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

  private getAuthHeadersFormData() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Token não encontrado');
    }
    return {
      'Authorization': `Bearer ${token}`,
      // Não definir Content-Type para FormData, o browser define automaticamente com boundary
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
      // Converte os enums de camelCase para o formato do frontend
      return response.data.map((submissao: any) => ({
        ...submissao,
        status: camelCaseToStatusSubmissao(submissao.status),
        formato: camelCaseToFormatoSubmissao(submissao.formato),
      }));
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
      // Converte os enums de camelCase para o formato do frontend
      return {
        ...response.data,
        status: camelCaseToStatusSubmissao(response.data.status),
        formato: camelCaseToFormatoSubmissao(response.data.formato),
      };
    } catch (error) {
      console.error(`Erro ao buscar submissão com ID ${id}:`, error);
      throw error;
    }
  }

  async getByTrilhaTematicaId(trilhaTematicaId: number): Promise<Submissao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/submissao/trilha-tematica/${trilhaTematicaId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      // Converte os enums de camelCase para o formato do frontend
      return response.data.map((submissao: any) => ({
        ...submissao,
        status: camelCaseToStatusSubmissao(submissao.status),
        formato: camelCaseToFormatoSubmissao(submissao.formato),
      }));
    } catch (error) {
      console.error(`Erro ao buscar submissões da trilha temática ${trilhaTematicaId}:`, error);
      throw error;
    }
  }

  async getMinhasSubmissoes(): Promise<Submissao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/submissao/autor/minhas`,
        {
          headers: this.getAuthHeaders()
        }
      );
      // Converte os enums de camelCase para o formato do frontend
      return response.data.map((submissao: any) => ({
        ...submissao,
        status: camelCaseToStatusSubmissao(submissao.status),
        formato: camelCaseToFormatoSubmissao(submissao.formato),
      }));
    } catch (error) {
      console.error("Erro ao buscar minhas submissões:", error);
      throw error;
    }
  }

  async getSubmissoesParaAvaliador(): Promise<Submissao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/submissao/avaliador/minhas`,
        {
          headers: this.getAuthHeaders()
        }
      );
      // Converte os enums de camelCase para o formato do frontend
      return response.data.map((submissao: any) => ({
        ...submissao,
        status: camelCaseToStatusSubmissao(submissao.status),
        formato: camelCaseToFormatoSubmissao(submissao.formato),
      }));
    } catch (error) {
      console.error("Erro ao buscar submissões para avaliar:", error);
      throw error;
    }
  }

  async verificarSubmissaoAutor(eventoId: number, trilhaTematicaId: number): Promise<VerificarSubmissaoAutor> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/submissao/autor/verificar/${eventoId}/${trilhaTematicaId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      // Converte o enum de status se existir
      const data = response.data;
      return {
        existeSubmissao: data.existeSubmissao,
        submissaoId: data.submissaoId,
        status: data.status ? camelCaseToStatusSubmissao(data.status) : undefined,
        podeFazerSubmissao: data.podeFazerSubmissao,
      };
    } catch (error) {
      console.error(`Erro ao verificar submissão do autor para evento ${eventoId} e trilha temática ${trilhaTematicaId}:`, error);
      throw error;
    }
  }

  async create(request: SubmissaoRequest): Promise<Submissao> {
    try {
      // O backend espera os enums no formato original (UPPER_SNAKE_CASE)
      // O JsonStringEnumConverter com JsonNamingPolicy.CamelCase do backend
      // faz a conversão internamente, mas parece que está esperando o formato original
      const statusStr = String(request.status); // Ex: "SUBMETIDA", "EM_AVALIACAO"
      const formatoStr = String(request.formato); // Ex: "ARTIGO_COMPLETO", "WORKSHOP"
      
      // Cria o objeto explicitamente para garantir que os enums sejam strings
      const apiRequest: SubmissaoRequestApi = {
        titulo: request.titulo,
        resumo: request.resumo,
        palavrasChave: request.palavrasChave,
        dataSubmissao: request.dataSubmissao,
        dataUltimaModificacao: request.dataUltimaModificacao,
        versao: request.versao,
        status: statusStr,
        formato: formatoStr,
        eventoId: request.eventoId,
        trilhaTematicaId: request.trilhaTematicaId,
      };
      
      const response = await axios.post(
        `${this.getApiUrl()}/submissao`,
        apiRequest,
        {
          headers: this.getAuthHeaders()
        }
      );
      // Converte os enums de camelCase para o formato do frontend
      return {
        ...response.data,
        status: camelCaseToStatusSubmissao(response.data.status),
        formato: camelCaseToFormatoSubmissao(response.data.formato),
      };
    } catch (error) {
      console.error("Erro ao criar submissão:", error);
      throw error;
    }
  }

  async update(id: number, request: SubmissaoRequest): Promise<Submissao> {
    try {
      // O backend espera os enums no formato original (UPPER_SNAKE_CASE)
      const statusStr = String(request.status);
      const formatoStr = String(request.formato);
      
      // Cria o objeto explicitamente para garantir que os enums sejam strings
      const apiRequest: SubmissaoRequestApi = {
        titulo: request.titulo,
        resumo: request.resumo,
        palavrasChave: request.palavrasChave,
        dataSubmissao: request.dataSubmissao,
        dataUltimaModificacao: request.dataUltimaModificacao,
        versao: request.versao,
        status: statusStr,
        formato: formatoStr,
        eventoId: request.eventoId,
        trilhaTematicaId: request.trilhaTematicaId,
      };
      
      const response = await axios.put(
        `${this.getApiUrl()}/submissao/${id}`,
        apiRequest,
        {
          headers: this.getAuthHeaders()
        }
      );
      // Converte os enums de camelCase para o formato do frontend
      return {
        ...response.data,
        status: camelCaseToStatusSubmissao(response.data.status),
        formato: camelCaseToFormatoSubmissao(response.data.formato),
      };
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

  async createComplete(
    request: SubmissaoRequest,
    arquivo: File,
    dois?: string[]
  ): Promise<SubmissaoCreateCompleteResult> {
    try {
      // Prepara os dados da submissão em formato JSON string
      const statusStr = String(request.status);
      const formatoStr = String(request.formato);
      
      const dadosSubmissao: SubmissaoRequestApi = {
        titulo: request.titulo,
        resumo: request.resumo,
        palavrasChave: request.palavrasChave,
        dataSubmissao: request.dataSubmissao,
        dataUltimaModificacao: request.dataUltimaModificacao,
        versao: request.versao,
        status: statusStr,
        formato: formatoStr,
        eventoId: request.eventoId,
        trilhaTematicaId: request.trilhaTematicaId,
      };

      // Cria FormData
      const formData = new FormData();
      formData.append('DadosSubmissao', JSON.stringify(dadosSubmissao));
      formData.append('Arquivo', arquivo);
      
      if (dois && dois.length > 0) {
        formData.append('Dois', JSON.stringify(dois));
      }

      const response = await axios.post(
        `${this.getApiUrl()}/submissao/complete`,
        formData,
        {
          headers: this.getAuthHeadersFormData()
        }
      );

      // Processa a resposta
      const responseData = response.data;
      
      // Se a resposta tem submissao diretamente (sucesso total)
      if (responseData.submissao) {
        return {
          submissao: {
            ...responseData.submissao,
            status: camelCaseToStatusSubmissao(responseData.submissao.status),
            formato: camelCaseToFormatoSubmissao(responseData.submissao.formato),
          },
          referenciasCriadas: responseData.referenciasCriadas || 0,
          errosReferencias: responseData.errosReferencias || [],
          temErrosParciais: responseData.errosReferencias?.length > 0 || false,
          mensagem: responseData.mensagem,
        };
      }
      
      // Se a resposta é a submissão diretamente (sem erros parciais)
      return {
        submissao: {
          ...responseData,
          status: camelCaseToStatusSubmissao(responseData.status),
          formato: camelCaseToFormatoSubmissao(responseData.formato),
        },
        referenciasCriadas: 0,
        errosReferencias: [],
        temErrosParciais: false,
      };
    } catch (error) {
      console.error("Erro ao criar submissão completa:", error);
      throw error;
    }
  }

  /**
   * Decide o status final de uma submissão em revisão.
   * O organizadorId é extraído automaticamente do token JWT no backend.
   * @param id ID da submissão
   * @param request Request com o novo status (APROVADA ou REJEITADA)
   */
  async decidirStatusRevisao(id: number, request: DecidirStatusRevisaoRequest): Promise<Submissao> {
    try {
      const requestBody = {
        status: statusSubmissaoToCamelCase(request.status),
      };

      // O token JWT é enviado automaticamente via getAuthHeaders()
      // O backend extrai o organizadorId do token
      const response = await axios.put(
        `${this.getApiUrl()}/submissao/${id}/decidir-status`,
        requestBody,
        {
          headers: this.getAuthHeaders()
        }
      );

      return {
        ...response.data,
        status: camelCaseToStatusSubmissao(response.data.status),
        formato: camelCaseToFormatoSubmissao(response.data.formato),
      };
    } catch (error) {
      console.error(`Erro ao decidir status de revisão da submissão ${id}:`, error);
      throw error;
    }
  }
}

export const submissaoService = new SubmissaoService();

