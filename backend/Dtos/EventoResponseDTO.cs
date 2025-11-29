using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record EventoResponseDTO
{
    public long Id { get; init; }
    public string Nome { get; init; }
    public string Descricao { get; init; }
    public DateTime DataInicio { get; init; }
    public DateTime DataFim { get; init; }
    public string Local { get; init; }
    public string Site { get; init; }
    public string Logo { get; init; }
    public string StatusEvento { get; init; }
    public ConfiguracaoEventoResponseDTO? Configuracao { get; init; }
    public List<OrganizadorResponseDTO> Organizadores { get; init; } = new();
    public List<TrilhaResponseDTO> Trilhas { get; init; } = new();
    public List<ComiteCientificoResponseDTO> Comites { get; init; } = new();

    public static EventoResponseDTO ValueOf(Evento evento)
    {
        return new EventoResponseDTO
        {
            Id = evento.Id,
            Nome = evento.Nome,
            Descricao = evento.Descricao,
            DataInicio = evento.DataInicio,
            DataFim = evento.DataFim,
            Local = evento.Local,
            Site = evento.Site,
            Logo = evento.Logo,
            StatusEvento = evento.StatusEvento,
            Configuracao = evento.Configuracao != null ? ConfiguracaoEventoResponseDTO.ValueOf(evento.Configuracao) : null,
            Organizadores = evento.Organizadores?.Select(o => OrganizadorResponseDTO.ValueOf(o)).ToList() ?? new List<OrganizadorResponseDTO>(),
            Trilhas = evento.Trilhas?.Select(t => TrilhaResponseDTO.ValueOf(t)).ToList() ?? new List<TrilhaResponseDTO>(),
            Comites = evento.Comites?.Select(c => ComiteCientificoResponseDTO.ValueOf(c)).ToList() ?? new List<ComiteCientificoResponseDTO>()
        };
    }
}

