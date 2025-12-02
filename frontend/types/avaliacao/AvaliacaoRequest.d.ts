import { RecomendacaoAvaliacao } from './RecomendacaoAvaliacao';

export interface AvaliacaoRequest {
  notaGeral: number;
  notaOriginalidade: number;
  notaMetodologia: number;
  notaRelevancia: number;
  notaRedacao: number;
  recomendacaoEnum: RecomendacaoAvaliacao;
  recomendacao: string;
  confidencial: boolean;
  submissaoId: number;
}

