import axios from 'axios';
import Cookies from 'js-cookie';
import { ArquivoSubmissao } from '@/types/submissao/ArquivoSubmissao';

class ArquivoSubmissaoService {
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
    };
  }

  async upload(
    submissaoId: number,
    arquivo: File
  ): Promise<ArquivoSubmissao> {
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      const response = await axios.post(
        `${this.getApiUrl()}/arquivosubmissao/${submissaoId}`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer upload do arquivo para submissão ${submissaoId}:`, error);
      throw error;
    }
  }

  async getById(id: number): Promise<ArquivoSubmissao> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/arquivosubmissao/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar arquivo com ID ${id}:`, error);
      throw error;
    }
  }

  async listarPorSubmissao(submissaoId: number): Promise<ArquivoSubmissao[]> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/arquivosubmissao/submissao/${submissaoId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar arquivos da submissão ${submissaoId}:`, error);
      throw error;
    }
  }

  async downloadArquivo(id: number): Promise<Blob> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/arquivosubmissao/${id}/download`,
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer download do arquivo com ID ${id}:`, error);
      throw error;
    }
  }
}

export const arquivoSubmissaoService = new ArquivoSubmissaoService();

