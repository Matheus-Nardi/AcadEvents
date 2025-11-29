using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record AvaliadorResponseDTO
{
    public long Id { get; init; }
    public string Nome { get; init; }
    public string Email { get; init; }
    public string Instituicao { get; init; }
    public string Pais { get; init; }
    public DateTime DataCadastro { get; init; }
    public bool Ativo { get; init; }
    public List<string> Especialidades { get; init; } = new();
    public int NumeroAvaliacoes { get; init; }
    public bool Disponibilidade { get; init; }
    public long? PerfilORCIDId { get; init; }

    public static AvaliadorResponseDTO ValueOf(Avaliador avaliador)
    {
        return new AvaliadorResponseDTO
        {
            Id = avaliador.Id,
            Nome = avaliador.Nome,
            Email = avaliador.Email,
            Instituicao = avaliador.Instituicao,
            Pais = avaliador.Pais,
            DataCadastro = avaliador.DataCadastro,
            Ativo = avaliador.Ativo,
            Especialidades = avaliador.Especialidades ?? new List<string>(),
            NumeroAvaliacoes = avaliador.NumeroAvaliacoes,
            Disponibilidade = avaliador.Disponibilidade,
            PerfilORCIDId = avaliador.PerfilORCIDId
        };
    }
}

