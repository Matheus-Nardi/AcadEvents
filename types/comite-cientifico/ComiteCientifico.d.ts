export interface ComiteCientifico {
  id: number;
  nome: string;
  tipo: string;
  descricao: string;
  eventoId: number;
  avaliadoresIds?: number[];
  coordenadoresIds?: number[];
}

