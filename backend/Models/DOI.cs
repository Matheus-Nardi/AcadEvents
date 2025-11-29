namespace AcadEvents.Models;

public class DOI : DefaultModel
{
    public string Codigo { get; set; }
    public string Url { get; set; }
    public DateTime DataRegistro { get; set; }
    public bool Valido { get; set; }

    // Relacionamento Inverso: 1 DOI -> 0..1 Submissao
    public Submissao? Submissao { get; set; }

    // Relacionamento Inverso: 1 DOI -> * Referencia
    public ICollection<Referencia> Referencias { get; set; } = new List<Referencia>();
}