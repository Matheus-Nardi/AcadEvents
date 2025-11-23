import { StatusSubmissao } from './StatusSubmissao';
import { FormatoSubmissao } from './FormatoSubmissao';

export interface SubmissaoRequest {
  titulo: string;
  resumo: string;
  palavrasChave: string[];
  dataSubmissao: string;
  dataUltimaModificacao: string;
  versao: number;
  status: StatusSubmissao;
  formato: FormatoSubmissao;
  eventoId: number;
  trilhaTematicaId: number;
}

