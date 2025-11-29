export interface Autor {
  id: number;
  nome: string;
  email: string;
  instituicao: string;
  pais: string;
  dataCadastro: string;
  ativo: boolean;
  biografia: string;
  areaAtuacao: string;
  lattes: string;
  perfilORCIDId: number | null;
}

