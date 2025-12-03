export interface StatusAvaliacao {
  submissaoId: number;
  numeroRequerido: number;
  convitesAceitos: number;
  convitesRecusados: number;
  convitesPendentes: number;
  avaliacoesCompletas: number;
  avaliacoesPendentes: number;
  faltamAvaliadores: boolean;
  quantidadeFaltante: number;
  podeCalcularStatus: boolean;
}

