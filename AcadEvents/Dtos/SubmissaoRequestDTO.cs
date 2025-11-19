using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record SubmissaoRequestDTO
{
    public string Titulo { get; init; }
    public string Resumo { get; init; }
    public List<string> PalavrasChave { get; init; } = new();
    public DateTime DataSubmissao { get; init; }
    public DateTime DataUltimaModificacao { get; init; }
    public int Versao { get; init; }
    public StatusSubmissao Status { get; init; }
    public FormatoSubmissao Formato { get; init; }
    public long AutorId { get; init; }
    public long TrilhaTematicaId { get; init; }
    public long? SessaoId { get; init; }
    public long? DOIId { get; init; }
}


