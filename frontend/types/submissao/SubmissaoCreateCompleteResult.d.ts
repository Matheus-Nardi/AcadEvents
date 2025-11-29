import { Submissao } from './Submissao';

export interface SubmissaoCreateCompleteResult {
  submissao: Submissao;
  referenciasCriadas: number;
  errosReferencias: string[];
  temErrosParciais: boolean;
  mensagem?: string;
}

