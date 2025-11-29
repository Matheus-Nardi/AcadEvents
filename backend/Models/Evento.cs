namespace AcadEvents.Models;

public class Evento : DefaultModel
{
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Local { get; set; }
    public string Site { get; set; }
    public string Logo { get; set; }
    public string StatusEvento { get; set; }

    // Relacionamento: 1 Evento -> 1 ConfiguracaoEvento
    public long ConfiguracaoEventoId { get; set; }
    public ConfiguracaoEvento Configuracao { get; set; }

    // Relacionamento: 1 Evento -> * Trilha
    public ICollection<Trilha> Trilhas { get; set; } = new List<Trilha>();

    // Relacionamento: 1 Evento -> 1..* ComiteCientifico
    public ICollection<ComiteCientifico> Comites { get; set; } = new List<ComiteCientifico>();

    // Relacionamento: 1 Evento -> * HistoricoEvento
    public ICollection<HistoricoEvento> Historico { get; set; } = new List<HistoricoEvento>();

    // Relacionamento: * Evento <-> * Organizador
    public ICollection<Organizador> Organizadores { get; set; } = new List<Organizador>();
}
