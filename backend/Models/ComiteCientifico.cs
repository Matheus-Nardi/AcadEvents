namespace AcadEvents.Models;

public class ComiteCientifico : DefaultModel
{
    public string Nome { get; set; }
    public string Tipo { get; set; }
    public string Descricao { get; set; }

    // Relacionamento Inverso: 1 ComiteCientifico -> 1 Evento
    public long EventoId { get; set; }
    public Evento Evento { get; set; }

    // Relacionamento: * ComiteCientifico <-> * Avaliador
    public ICollection<Avaliador> MembrosAvaliadores { get; set; } = new List<Avaliador>();

    // Relacionamento: * ComiteCientifico <-> * Organizador
    public ICollection<Organizador> Coordenadores { get; set; } = new List<Organizador>();
}