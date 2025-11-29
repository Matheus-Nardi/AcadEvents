namespace AcadEvents.Dtos;

public record AvaliadorRequestDTO
{
    public string Nome { get; init; }
    public string Email { get; init; }
    public string Senha { get; init; }
    public string Instituicao { get; init; }
    public string Pais { get; init; }
    public List<string> Especialidades { get; init; } = new();
    public int NumeroAvaliacoes { get; init; }
    public bool Disponibilidade { get; init; }
    public long? PerfilORCIDId { get; init; }
}

