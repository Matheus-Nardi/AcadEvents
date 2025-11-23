import { StatusSubmissao } from "@/types/submissao/StatusSubmissao"
import { FormatoSubmissao } from "@/types/submissao/FormatoSubmissao"

/**
 * Converte uma string UPPER_CASE para camelCase
 * Ex: RASCUNHO -> rascunho, EM_AVALIACAO -> emAvaliacao
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
  rascunho: StatusSubmissao.RASCUNHO,
  submetida: StatusSubmissao.SUBMETIDA,
  emAvaliacao: StatusSubmissao.EM_AVALIACAO,
  aprovada: StatusSubmissao.APROVADA,
  aprovadaComRessalvas: StatusSubmissao.APROVADA_COM_RESSALVAS,
  rejeitada: StatusSubmissao.REJEITADA,
  retirada: StatusSubmissao.RETIRADA,
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
 * Converte StatusSubmissao para camelCase string
 */
export function statusSubmissaoToCamelCase(status: StatusSubmissao): string {
  return toCamelCase(status)
}

/**
 * Converte FormatoSubmissao para camelCase string
 */
export function formatoSubmissaoToCamelCase(formato: FormatoSubmissao): string {
  return toCamelCase(formato)
}

/**
 * Converte string camelCase de volta para StatusSubmissao
 */
export function camelCaseToStatusSubmissao(camelCase: string): StatusSubmissao {
  return statusCamelCaseMap[camelCase] || StatusSubmissao.RASCUNHO
}

/**
 * Converte string camelCase de volta para FormatoSubmissao
 */
export function camelCaseToFormatoSubmissao(camelCase: string): FormatoSubmissao {
  return formatoCamelCaseMap[camelCase] || FormatoSubmissao.ARTIGO_COMPLETO
}

