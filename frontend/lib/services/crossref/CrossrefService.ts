import axios from 'axios';
import { CrossrefWork, ReferenciaCrossref } from '@/types/crossref/CrossrefWork';

class CrossrefService {
  private readonly baseUrl = 'https://api.crossref.org/works';

  /**
   * Normaliza um DOI removendo prefixos de URL
   */
  private normalizeDoi(doi: string): string {
    return doi.trim().replace(/^https?:\/\/doi\.org\//i, '').replace(/^doi:/i, '');
  }

  /**
   * Formata os autores em uma string legível
   */
  private formatAuthors(authors?: Array<{ given?: string; family?: string }>): string {
    if (!authors || authors.length === 0) {
      return 'Autor desconhecido';
    }

    return authors
      .map((author) => {
        const parts = [];
        if (author.given) parts.push(author.given);
        if (author.family) parts.push(author.family);
        return parts.join(' ');
      })
      .join(', ');
  }

  /**
   * Extrai o ano da data de publicação
   */
  private extractYear(published?: { 'date-parts'?: number[][] }): number | undefined {
    if (!published || !published['date-parts'] || published['date-parts'].length === 0) {
      return undefined;
    }

    const dateParts = published['date-parts'][0];
    if (dateParts && dateParts.length > 0) {
      return dateParts[0];
    }

    return undefined;
  }

  /**
   * Busca informações de uma referência pelo DOI na API do Crossref
   */
  async buscarPorDoi(doi: string): Promise<ReferenciaCrossref> {
    try {
      const doiNormalizado = this.normalizeDoi(doi);

      if (!doiNormalizado) {
        throw new Error('DOI inválido');
      }

      const response = await axios.get<{ message: CrossrefWork }>(
        `${this.baseUrl}/${encodeURIComponent(doiNormalizado)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000, // 10 segundos de timeout
        }
      );

      const work = response.data.message;

      if (!work) {
        throw new Error('Referência não encontrada no Crossref');
      }

      // Formata os dados para o formato simplificado
      const referencia: ReferenciaCrossref = {
        doi: work.DOI || doiNormalizado,
        titulo: work.title?.[0] || work['short-title']?.[0] || undefined,
        autores: this.formatAuthors(work.author),
        ano: this.extractYear(work.published),
        publicacao: work['container-title']?.[0] || undefined,
        publisher: work.publisher || undefined,
        abstract: work.abstract || undefined,
        tipoPublicacao: work.type || undefined,
      };

      return referencia;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('DOI não encontrado no Crossref');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Tempo de espera esgotado ao buscar no Crossref');
        }
        throw new Error(`Erro ao buscar no Crossref: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Valida se um DOI tem formato válido (sem fazer requisição)
   */
  validarFormatoDoi(doi: string): boolean {
    const doiNormalizado = this.normalizeDoi(doi);
    // Formato básico de DOI: prefixo/sufixo
    const doiRegex = /^10\.\d{4,}\/.+$/;
    return doiRegex.test(doiNormalizado);
  }
}

export const crossrefService = new CrossrefService();

