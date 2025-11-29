namespace AcadEvents.Models;

public class Sessao : DefaultModel
{
    public string Nome { get; set; }
    public DateTime Data { get; set; }
    public string Sala { get; set; }
    public string Moderador { get; set; }
    public string Tipo { get; set; }

    // Relacionamento Inverso: 1 Sessao -> 1 Trilha
    public long TrilhaId { get; set; }
    public Trilha Trilha { get; set; }

    // Relacionamento: 1 Sessao -> * Submissao
    public ICollection<Submissao> SubmissoesApresentadas { get; set; } = new List<Submissao>();
}