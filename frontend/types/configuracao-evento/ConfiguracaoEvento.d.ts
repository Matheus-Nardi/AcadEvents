export interface ConfiguracaoEvento {
  id: number;
  prazoSubmissao: string;
  prazoAvaliacao: string;
  numeroAvaliadoresPorSubmissao: number;
  avaliacaoDuploCego: boolean;
  permiteResubmissao: boolean;
}

