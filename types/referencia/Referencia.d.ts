export interface Referencia {
  id: number;
  titulo: string;
  autores: string;
  ano: number;
  publicacao: string;
  // Informações do DOI
  doiCodigo?: string;
  doiUrl?: string;
  doiValido?: boolean;
  // Informações adicionais
  abstract?: string;
  tipoPublicacao?: string;
  publisher?: string;
  // Relacionamento
  submissaoId: number;
}

