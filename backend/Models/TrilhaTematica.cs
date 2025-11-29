namespace AcadEvents.Models;

public class TrilhaTematica : DefaultModel
{
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public List<string> PalavrasChave { get; set; } = new List<string>();

    // Relacionamento Inverso: 1 TrilhaTematica -> 1 Trilha (opcional)
    public long? TrilhaId { get; set; }
    public Trilha? Trilha { get; set; }

    // Relacionamento: 1 TrilhaTematica -> * Submissao
    public ICollection<Submissao> Submissoes { get; set; } = new List<Submissao>();
}