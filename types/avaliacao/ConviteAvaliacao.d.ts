export interface ConviteAvaliacao {
  id: number;
  dataConvite: string;
  status: string;
  motivoRecusa?: string;
  avaliadorId: number;
  submissaoId: number;
}

