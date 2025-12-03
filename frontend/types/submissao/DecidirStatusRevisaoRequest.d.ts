import { StatusSubmissao } from './StatusSubmissao';

export interface DecidirStatusRevisaoRequest {
  status: StatusSubmissao.APROVADA | StatusSubmissao.REJEITADA;
}
