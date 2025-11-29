namespace AcadEvents.Dtos;

public record ComiteCientificoRequestDTO
{
    public string Nome { get; init; }
    public string Tipo { get; init; }
    public string Descricao { get; init; }
    public List<long>? AvaliadoresIds { get; init; }
    public List<long>? CoordenadoresIds { get; init; }
}

