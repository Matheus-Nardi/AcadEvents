using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record AutorResponseDTO
{
    public long Id { get; init; }
    public string Nome { get; init; }
    public string Email { get; init; }
    public string Instituicao { get; init; }
    public string Pais { get; init; }
    public DateTime DataCadastro { get; init; }
    public bool Ativo { get; init; }
    public string Biografia { get; init; }
    public string AreaAtuacao { get; init; }
    public string Lattes { get; init; }
    public long? PerfilORCIDId { get; init; }

    public static AutorResponseDTO ValueOf(Autor autor)
    {
        return new AutorResponseDTO
        {
            Id = autor.Id,
            Nome = autor.Nome,
            Email = autor.Email,
            Instituicao = autor.Instituicao,
            Pais = autor.Pais,
            DataCadastro = autor.DataCadastro,
            Ativo = autor.Ativo,
            Biografia = autor.Biografia,
            AreaAtuacao = autor.AreaAtuacao,
            Lattes = autor.Lattes,
            PerfilORCIDId = autor.PerfilORCIDId
        };
    }
}

