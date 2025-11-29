export interface ConviteAvaliacao {
  id: number;
  dataConvite: string;
  status: string;
  aceito?: boolean | null;
  motivoRecusa?: string;
  avaliadorId: number;
  submissaoId: number;
}

