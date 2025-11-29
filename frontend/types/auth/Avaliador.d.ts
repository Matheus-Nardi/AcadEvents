export interface Avaliador {
  id: number;
  nome: string;
  email: string;
  instituicao: string;
  pais: string;
  dataCadastro: string;
  ativo: boolean;
  especialidades: string[];
  numeroAvaliacoes: number;
  disponibilidade: boolean;
  perfilORCIDId: number | null;
}

