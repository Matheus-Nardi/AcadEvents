export interface OrganizadorRequest {
  nome: string;
  email: string;
  senha: string;
  instituicao: string;
  pais: string;
  cargo: string;
  permissoes: string[];
  perfilORCIDId: number | null;
}

