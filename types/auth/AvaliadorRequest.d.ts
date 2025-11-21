export interface AvaliadorRequest {
  nome: string;
  email: string;
  instituicao: string;
  pais: string;
  ativo: boolean;
  especialidades: string[];
  disponibilidade: boolean;
  perfilORCIDId: number | null;
}

