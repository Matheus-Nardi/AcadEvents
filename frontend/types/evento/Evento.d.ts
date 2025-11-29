import { ConfiguracaoEvento } from "@/types/configuracao-evento/ConfiguracaoEvento";
import { Organizador } from "@/types/auth/Organizador";
import { Trilha } from "@/types/trilha/Trilha";
import { ComiteCientifico } from "@/types/comite-cientifico/ComiteCientifico";

export interface Evento {
  id: number;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  site: string;
  logo: string;
  statusEvento: string;
  configuracao?: ConfiguracaoEvento;
  organizadores?: Organizador[];
  trilhas?: Trilha[];
  comites?: ComiteCientifico[];
}

