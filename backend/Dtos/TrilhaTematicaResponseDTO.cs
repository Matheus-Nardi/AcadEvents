using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record TrilhaTematicaResponseDTO
{
    public long Id { get; init; }
    public string Nome { get; init; }
    public string Descricao { get; init; }
    public List<string> PalavrasChave { get; init; } = new();
    public long? TrilhaId { get; init; }

    public static TrilhaTematicaResponseDTO ValueOf(TrilhaTematica trilhaTematica)
    {
        return new TrilhaTematicaResponseDTO
        {
            Id = trilhaTematica.Id,
            Nome = trilhaTematica.Nome,
            Descricao = trilhaTematica.Descricao,
            PalavrasChave = trilhaTematica.PalavrasChave ?? new List<string>(),
            TrilhaId = trilhaTematica.TrilhaId ?? null
        };
    }
}

