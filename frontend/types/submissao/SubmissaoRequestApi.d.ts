/**
 * Interface para o request da API
 * Os enums são enviados como strings em camelCase
 */
export interface SubmissaoRequestApi {
  titulo: string;
  resumo: string;
  palavrasChave: string[];
  dataSubmissao: string;
  dataUltimaModificacao: string;
  versao: number;
  status: string; // Enum como string em formato original (ex: "SUBMETIDA", "EM_AVALIACAO")
  formato: string; // Enum como string em camelCase (ex: "artigoCompleto", "workshop")
  eventoId: number;
  trilhaTematicaId: number;
  submissaoOriginalId?: number;
}

