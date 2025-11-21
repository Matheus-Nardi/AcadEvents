export interface Evento {
  id: number;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  site: string;
  logo: string;
  statusEvento: string;
  configuracaoEventoId: number;
  organizadoresIds: number[];
}

