namespace AcadEvents.Dtos;

public record StatusAvaliacaoDTO
{
    public long SubmissaoId { get; init; }
    public int NumeroRequerido { get; init; }
    public int ConvitesAceitos { get; init; }
    public int ConvitesRecusados { get; init; }
    public int ConvitesPendentes { get; init; }
    public int AvaliacoesCompletas { get; init; }
    public int AvaliacoesPendentes { get; init; }
    public bool FaltamAvaliadores { get; init; }
    public int QuantidadeFaltante { get; init; }
    public bool PodeCalcularStatus { get; init; }
}

