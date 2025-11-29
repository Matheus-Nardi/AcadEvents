namespace AcadEvents.Dtos;

public record TrilhaRequestDTO
{
    public string Nome { get; init; }
    public string Descricao { get; init; }
    public string Coordenador { get; init; }
}

