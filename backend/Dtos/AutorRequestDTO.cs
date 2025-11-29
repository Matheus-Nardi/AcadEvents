namespace AcadEvents.Dtos;

public record AutorRequestDTO
{
    public string Nome { get; init; }
    public string Email { get; init; }
    public string Senha { get; init; }
    public string Instituicao { get; init; }
    public string Pais { get; init; }
    public string Biografia { get; init; }
    public string AreaAtuacao { get; init; }
    public string Lattes { get; init; }
    public long? PerfilORCIDId { get; init; }
}

