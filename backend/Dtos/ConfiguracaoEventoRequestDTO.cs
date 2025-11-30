namespace AcadEvents.Dtos;

public record ConfiguracaoEventoRequestDTO
{
    public DateTime PrazoSubmissao { get; init; }
    public DateTime PrazoAvaliacao { get; init; }
    public int NumeroAvaliadoresPorSubmissao { get; init; }
}

