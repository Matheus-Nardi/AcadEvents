namespace AcadEvents.Dtos;

public record OrganizadorRequestDTO
{
    public string Nome { get; init; }
    public string Email { get; init; }
    public string Senha { get; init; }
    public string Instituicao { get; init; }
    public string Pais { get; init; }
    public string Cargo { get; init; }
    public List<string> Permissoes { get; init; } = new();
    public long? PerfilORCIDId { get; init; }
}

