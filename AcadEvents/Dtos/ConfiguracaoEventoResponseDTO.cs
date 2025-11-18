using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record ConfiguracaoEventoResponseDTO
{
    public long Id { get; init; }
    public DateTime PrazoSubmissao { get; init; }
    public DateTime PrazoAvaliacao { get; init; }
    public int NumeroAvaliadoresPorSubmissao { get; init; }
    public bool AvaliacaoDuploCego { get; init; }
    public bool PermiteResubmissao { get; init; }

    public static ConfiguracaoEventoResponseDTO ValueOf(ConfiguracaoEvento configuracao)
    {
        return new ConfiguracaoEventoResponseDTO
        {
            Id = configuracao.Id,
            PrazoSubmissao = configuracao.PrazoSubmissao,
            PrazoAvaliacao = configuracao.PrazoAvaliacao,
            NumeroAvaliadoresPorSubmissao = configuracao.NumeroAvaliadoresPorSubmissao,
            AvaliacaoDuploCego = configuracao.AvaliacaoDuploCego,
            PermiteResubmissao = configuracao.PermiteResubmissao
        };
    }
}

