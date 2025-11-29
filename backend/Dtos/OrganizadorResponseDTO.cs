using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record OrganizadorResponseDTO
{
    public long Id { get; init; }
    public string Nome { get; init; }
    public string Email { get; init; }
    public string Instituicao { get; init; }
    public string Pais { get; init; }
    public DateTime DataCadastro { get; init; }
    public bool Ativo { get; init; }
    public string Cargo { get; init; }
    public List<string> Permissoes { get; init; } = new();
    public long? PerfilORCIDId { get; init; }

    public static OrganizadorResponseDTO ValueOf(Organizador organizador)
    {
        return new OrganizadorResponseDTO
        {
            Id = organizador.Id,
            Nome = organizador.Nome,
            Email = organizador.Email,
            Instituicao = organizador.Instituicao,
            Pais = organizador.Pais,
            DataCadastro = organizador.DataCadastro,
            Ativo = organizador.Ativo,
            Cargo = organizador.Cargo,
            Permissoes = organizador.Permissoes ?? new List<string>(),
            PerfilORCIDId = organizador.PerfilORCIDId
        };
    }
}

