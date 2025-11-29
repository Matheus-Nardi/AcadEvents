// Tipos para a resposta da API do Crossref
export interface CrossrefAuthor {
  given?: string;
  family?: string;
  sequence?: string;
}

export interface CrossrefWork {
  DOI: string;
  title?: string[];
  author?: CrossrefAuthor[];
  published?: {
    'date-parts'?: number[][];
  };
  'container-title'?: string[];
  publisher?: string;
  abstract?: string;
  type?: string;
  'short-title'?: string[];
  subtitle?: string[];
}

export interface CrossrefMessage {
  status: string;
  'message-type': string;
  'message-version': string;
  message: CrossrefWork;
}

export interface CrossrefResponse {
  status: string;
  'message-type': string;
  'message-version': string;
  message: CrossrefMessage;
}

// Tipo simplificado para uso no componente
export interface ReferenciaCrossref {
  doi: string;
  titulo?: string;
  autores?: string;
  ano?: number;
  publicacao?: string;
  publisher?: string;
  abstract?: string;
  tipoPublicacao?: string;
}

