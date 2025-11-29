namespace AcadEvents.Dtos;

public record AvaliacaoRequestDTO
{
    public double NotaGeral { get; init; }
    public double NotaOriginalidade { get; init; }
    public double NotaMetodologia { get; init; }
    public double NotaRelevancia { get; init; }
    public double NotaRedacao { get; init; }
    public string Recomendacao { get; init; }
    public bool Confidencial { get; init; }
    public long SubmissaoId { get; init; }
}


