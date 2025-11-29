import { Autor } from './Autor';
import { Avaliador } from './Avaliador';
import { Organizador } from './Organizador';

export type User = Autor | Avaliador | Organizador;

export interface BaseUser {
  id: number;
  nome: string;
  email: string;
}

