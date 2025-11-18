using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record ComiteCientificoResponseDTO
{
    public long Id { get; init; }
    public string Nome { get; init; }
    public string Tipo { get; init; }
    public string Descricao { get; init; }
    public long EventoId { get; init; }
    public List<long> AvaliadoresIds { get; init; } = new();
    public List<long> CoordenadoresIds { get; init; } = new();

    public static ComiteCientificoResponseDTO ValueOf(ComiteCientifico comite)
    {
        return new ComiteCientificoResponseDTO
        {
            Id = comite.Id,
            Nome = comite.Nome,
            Tipo = comite.Tipo,
            Descricao = comite.Descricao,
            EventoId = comite.EventoId,
            AvaliadoresIds = comite.MembrosAvaliadores?.Select(a => a.Id).ToList() ?? new List<long>(),
            CoordenadoresIds = comite.Coordenadores?.Select(o => o.Id).ToList() ?? new List<long>()
        };
    }
}

