namespace AcadEvents.Models;

public class Trilha : DefaultModel
{
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public string Coordenador { get; set; }

    // Relacionamento: * Trilha <-> * Evento (N:N)
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();

    // Relacionamento: 1 Trilha -> * TrilhaTematica
    public ICollection<TrilhaTematica> Tematicas { get; set; } = new List<TrilhaTematica>();

    // Relacionamento: 1 Trilha -> * Sessao
    public ICollection<Sessao> Sessoes { get; set; } = new List<Sessao>();

}