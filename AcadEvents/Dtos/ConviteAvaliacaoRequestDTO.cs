namespace AcadEvents.Dtos;

public record ConviteAvaliacaoRequestDTO
{
    public long SubmissaoId { get; init; }
    public DateTime PrazoAvaliacao { get; init; }
    public List<long>? AvaliadoresIds { get; init; } // Opcional: se não fornecido, envia para todos do comitê
}

