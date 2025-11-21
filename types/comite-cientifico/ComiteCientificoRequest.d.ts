export interface ComiteCientificoRequest {
  nome: string;
  tipo: string;
  descricao: string;
  avaliadoresIds?: number[];
  coordenadoresIds?: number[];
}

