import { Avaliador } from '@/types/auth/Avaliador';
import { Organizador } from '@/types/auth/Organizador';

export interface ComiteCientifico {
  id: number;
  nome: string;
  tipo: string;
  descricao: string;
  eventoId: number;
  avaliadores?: Avaliador[];
  coordenadores?: Organizador[];
  // Mantido para compatibilidade com código que ainda usa IDs
  avaliadoresIds?: number[];
  coordenadoresIds?: number[];
}

