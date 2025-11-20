export interface Organizador {
  id: number;
  nome: string;
  email: string;
  instituicao: string;
  pais: string;
  dataCadastro: string;
  ativo: boolean;
  cargo: string;
  permissoes: string[];
  perfilORCIDId: number | null;
}

