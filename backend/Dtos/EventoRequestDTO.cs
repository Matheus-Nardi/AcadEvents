namespace AcadEvents.Dtos;

public record EventoRequestDTO
{
    public string Nome { get; init; }
    public string Descricao { get; init; }
    public DateTime DataInicio { get; init; }
    public DateTime DataFim { get; init; }
    public string Local { get; init; }
    public string Site { get; init; }
    public string Logo { get; init; }
    public string StatusEvento { get; init; }
    public long ConfiguracaoEventoId { get; init; }
}

