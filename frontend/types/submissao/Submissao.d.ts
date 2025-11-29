import { StatusSubmissao } from './StatusSubmissao';
import { FormatoSubmissao } from './FormatoSubmissao';

export interface Submissao {
  id: number;
  titulo: string;
  resumo: string;
  palavrasChave: string[];
  dataSubmissao: string;
  dataUltimaModificacao: string;
  versao: number;
  status: StatusSubmissao;
  formato: FormatoSubmissao;
  autorId: number;
  autorNome?: string;
  trilhaTematicaId: number;
  trilhaTematicaNome?: string;
  sessaoId?: number;
  doiId?: number;
}

