namespace AcadEvents.Dtos;

public record SubmissaoCreateCompleteResultDTO
{
    public SubmissaoResponseDTO Submissao { get; init; } = null!;
    public int ReferenciasCriadas { get; init; }
    public List<string> ErrosReferencias { get; init; } = new();
    public bool TemErrosParciais => ErrosReferencias.Any();
}

