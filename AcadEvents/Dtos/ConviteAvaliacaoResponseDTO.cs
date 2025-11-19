using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record ConviteAvaliacaoResponseDTO
{
    public long Id { get; init; }
    public DateTime DataConvite { get; init; }
    public DateTime? DataResposta { get; init; }
    public DateTime PrazoAvaliacao { get; init; }
    public bool? Aceito { get; init; }
    public string? MotivoRecusa { get; init; }
    public long AvaliadorId { get; init; }
    public string? AvaliadorNome { get; init; }
    public long SubmissaoId { get; init; }
    public string? SubmissaoTitulo { get; init; }

    public static ConviteAvaliacaoResponseDTO ValueOf(ConviteAvaliacao convite)
    {
        return new ConviteAvaliacaoResponseDTO
        {
            Id = convite.Id,
            DataConvite = convite.DataConvite,
            DataResposta = convite.DataResposta,
            PrazoAvaliacao = convite.PrazoAvaliacao,
            Aceito = convite.Aceito,
            MotivoRecusa = convite.MotivoRecusa,
            AvaliadorId = convite.AvaliadorId,
            AvaliadorNome = convite.Avaliador?.Nome,
            SubmissaoId = convite.SubmissaoId,
            SubmissaoTitulo = convite.Submissao?.Titulo
        };
    }
}


