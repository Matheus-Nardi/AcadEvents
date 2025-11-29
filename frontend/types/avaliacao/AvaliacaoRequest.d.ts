export interface AvaliacaoRequest {
  notaGeral: number;
  notaOriginalidade: number;
  notaMetodologia: number;
  notaRelevancia: number;
  notaRedacao: number;
  recomendacao: string;
  confidencial: boolean;
  submissaoId: number;
}

