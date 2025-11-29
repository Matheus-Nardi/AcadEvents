using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record ComiteCientificoResponseDTO
{
    public long Id { get; init; }
    public string Nome { get; init; }
    public string Tipo { get; init; }
    public string Descricao { get; init; }
    public long EventoId { get; init; }
    public List<AvaliadorResponseDTO> Avaliadores { get; init; } = new();
    public List<OrganizadorResponseDTO> Coordenadores { get; init; } = new();

    public static ComiteCientificoResponseDTO ValueOf(ComiteCientifico comite)
    {
        return new ComiteCientificoResponseDTO
        {
            Id = comite.Id,
            Nome = comite.Nome,
            Tipo = comite.Tipo,
            Descricao = comite.Descricao,
            EventoId = comite.EventoId,
            Avaliadores = comite.MembrosAvaliadores?.Select(a => AvaliadorResponseDTO.ValueOf(a)).ToList() ?? new List<AvaliadorResponseDTO>(),
            Coordenadores = comite.Coordenadores?.Select(o => OrganizadorResponseDTO.ValueOf(o)).ToList() ?? new List<OrganizadorResponseDTO>()
        };
    }
}

