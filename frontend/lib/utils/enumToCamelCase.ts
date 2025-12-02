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
  return statusCamelCaseMap[camelCase] || StatusSubmissao.SUBMETIDA
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
 * Converte string camelCase de volta para RecomendacaoAvaliacao
 */
export function camelCaseToRecomendacaoAvaliacao(camelCase: string): RecomendacaoAvaliacao {
  return recomendacaoCamelCaseMap[camelCase] || RecomendacaoAvaliacao.APROVAR
}

