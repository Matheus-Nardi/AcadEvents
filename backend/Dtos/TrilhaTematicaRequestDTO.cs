namespace AcadEvents.Dtos;

public record TrilhaTematicaRequestDTO
{
    public string Nome { get; init; }
    public string Descricao { get; init; }
    public List<string> PalavrasChave { get; init; } = new();
}

