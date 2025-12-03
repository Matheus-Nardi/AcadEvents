import { StatusSubmissao } from "@/types/submissao/StatusSubmissao"
import { FormatoSubmissao } from "@/types/submissao/FormatoSubmissao"
import { RecomendacaoAvaliacao } from "@/types/avaliacao/RecomendacaoAvaliacao"

/**
 * Converte uma string UPPER_CASE para camelCase
 * Ex: SUBMETIDA -> submetida, EM_AVALIACAO -> emAvaliacao
 */
function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split('_')
    .map((word, index) => {
      if (index === 0) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}

/**
 * Mapeamento de camelCase para StatusSubmissao
 */
const statusCamelCaseMap: Record<string, StatusSubmissao> = {
  submetida: StatusSubmissao.SUBMETIDA,
  emAvaliacao: StatusSubmissao.EM_AVALIACAO,
  aprovada: StatusSubmissao.APROVADA,
  aprovadaComRessalvas: StatusSubmissao.APROVADA_COM_RESSALVAS,
  rejeitada: StatusSubmissao.REJEITADA,
  emRevisao: StatusSubmissao.EM_REVISÃO,
}

/**
 * Mapeamento de camelCase para FormatoSubmissao
 */
const formatoCamelCaseMap: Record<string, FormatoSubmissao> = {
  artigoCompleto: FormatoSubmissao.ARTIGO_COMPLETO,
  artigoResumido: FormatoSubmissao.ARTIGO_RESUMIDO,
  poster: FormatoSubmissao.POSTER,
  resumoExpandido: FormatoSubmissao.RESUMO_EXPANDIDO,
  workshop: FormatoSubmissao.WORKSHOP,
}

/**
 * Mapeamento de camelCase para RecomendacaoAvaliacao
 */
const recomendacaoCamelCaseMap: Record<string, RecomendacaoAvaliacao> = {
  aprovar: RecomendacaoAvaliacao.APROVAR,
  rejeitar: RecomendacaoAvaliacao.REJEITAR,
  aprovarComRessalvas: RecomendacaoAvaliacao.APROVAR_COM_RESSALVAS,
}

/**
 * Converte StatusSubmissao para camelCase string
 */
export function statusSubmissaoToCamelCase(status: StatusSubmissao): string {
  // Garante que estamos trabalhando com string
  const statusStr = String(status);
  return toCamelCase(statusStr);
}

/**
 * Converte FormatoSubmissao para camelCase string
 */
export function formatoSubmissaoToCamelCase(formato: FormatoSubmissao): string {
  // Garante que estamos trabalhando com string
  const formatoStr = String(formato);
  return toCamelCase(formatoStr);
}

/**
 * Converte string camelCase de volta para StatusSubmissao
 */
export function camelCaseToStatusSubmissao(camelCase: string): StatusSubmissao {
  // Se for undefined ou null, retorna SUBMETIDA
  if (!camelCase) {
    console.warn('Status vazio ou undefined recebido, usando SUBMETIDA como padrão');
    return StatusSubmissao.SUBMETIDA;
  }

  // Normaliza para lowercase para garantir comparação correta
  const normalized = camelCase.toLowerCase().trim();
  
  // Busca no mapa (também normalizado)
  const mappedStatus = statusCamelCaseMap[normalized];
  
  if (mappedStatus !== undefined) {
    return mappedStatus;
  }

  // Se não encontrou, tenta mapear diretamente os valores do enum
  // Caso o backend retorne em formato diferente (ex: "APROVADA_COM_RESSALVAS")
  const upperCaseValue = camelCase.toUpperCase();
  if (upperCaseValue in StatusSubmissao) {
    return StatusSubmissao[upperCaseValue as keyof typeof StatusSubmissao] as StatusSubmissao;
  }

  // Log para debug quando não encontrar o status
  console.warn(`Status não mapeado recebido: "${camelCase}". Usando SUBMETIDA como padrão.`);
  console.warn('Valores disponíveis no mapa:', Object.keys(statusCamelCaseMap));
  
  return StatusSubmissao.SUBMETIDA;
}

/**
 * Converte string camelCase de volta para FormatoSubmissao
 */
export function camelCaseToFormatoSubmissao(camelCase: string): FormatoSubmissao {
  return formatoCamelCaseMap[camelCase] || FormatoSubmissao.ARTIGO_COMPLETO
}

/**
 * Converte RecomendacaoAvaliacao para camelCase string
 */
export function recomendacaoAvaliacaoToCamelCase(recomendacao: RecomendacaoAvaliacao): string {
  const recomendacaoStr = String(recomendacao);
  return toCamelCase(recomendacaoStr);
}

/**
 * Converte RecomendacaoAvaliacao para UPPER_SNAKE_CASE string (com underscore)
 * Ex: APROVAR_COM_RESSALVAS -> APROVAR_COM_RESSALVAS
 */
export function recomendacaoAvaliacaoToSnakeCase(recomendacao: RecomendacaoAvaliacao): string {
  // O enum já está no formato correto (APROVAR_COM_RESSALVAS), apenas retorna como string
  return String(recomendacao);
}

/**
 * Converte string camelCase de volta para RecomendacaoAvaliacao
 */
export function camelCaseToRecomendacaoAvaliacao(camelCase: string): RecomendacaoAvaliacao {
  return recomendacaoCamelCaseMap[camelCase] || RecomendacaoAvaliacao.APROVAR
}

