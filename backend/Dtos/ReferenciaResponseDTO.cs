using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record ReferenciaResponseDTO
{
    public long Id { get; init; }
    public string Titulo { get; init; }
    public string Autores { get; init; }
    public int Ano { get; init; }
    public string Publicacao { get; init; }
    
    // Informações do DOI
    public string? DoiCodigo { get; init; }
    public string? DoiUrl { get; init; }
    public bool? DoiValido { get; init; }
    
    // Informações adicionais
    public string? Abstract { get; init; }
    public string? TipoPublicacao { get; init; }
    public string? Publisher { get; init; }
    
    // Relacionamento
    public long SubmissaoId { get; init; }

    public static ReferenciaResponseDTO ValueOf(Referencia referencia)
    {
        return new ReferenciaResponseDTO
        {
            Id = referencia.Id,
            Titulo = referencia.Titulo,
            Autores = referencia.Autores,
            Ano = referencia.Ano,
            Publicacao = referencia.Publicacao,
            DoiCodigo = referencia.DOI?.Codigo,
            DoiUrl = referencia.DOI?.Url,
            DoiValido = referencia.DOI?.Valido,
            Abstract = referencia.Abstract,
            TipoPublicacao = referencia.TipoPublicacao,
            Publisher = referencia.Publisher,
            SubmissaoId = referencia.SubmissaoId
        };
    }
}

