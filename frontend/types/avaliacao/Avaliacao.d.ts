export interface Avaliacao {
  id: number;
  dataCriacao: string;
  notaGeral: number;
  notaOriginalidade: number;
  notaMetodologia: number;
  notaRelevancia: number;
  notaRedacao: number;
  recomendacao: string;
  confidencial: boolean;
  avaliadorId: number;
  avaliadorNome?: string;
  submissaoId: number;
  submissaoTitulo?: string;
}

