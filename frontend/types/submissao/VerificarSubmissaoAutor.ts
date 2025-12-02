import { StatusSubmissao } from './StatusSubmissao';

export interface VerificarSubmissaoAutor {
  existeSubmissao: boolean;
  submissaoId?: number;
  status?: StatusSubmissao;
  podeFazerSubmissao: boolean;
}

