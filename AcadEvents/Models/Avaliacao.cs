namespace AcadEvents.Models;

public class Avaliacao : DefaultModel
{
    public DateTime DataCriacao { get; set; }
    
    public double NotaGeral { get; set; }
    public double NotaOriginalidade { get; set; }
    public double NotaMetodologia { get; set; }
    public double NotaRelevancia { get; set; }
    public double NotaRedacao { get; set; }
    public string Recomendacao { get; set; }
    public bool Confidencial { get; set; }

    // Relacionamento Inverso: 1 Avaliacao -> 1 Avaliador
    public long AvaliadorId { get; set; }
    public Avaliador Avaliador { get; set; }

    // Relacionamento Inverso: 1 Avaliacao -> 1 Submissao
    public long SubmissaoId { get; set; }
    public Submissao Submissao { get; set; }
}