namespace AcadEvents.Models;

public class ConfiguracaoEvento : DefaultModel
{
    public DateTime PrazoSubmissao { get; set; }
    public DateTime PrazoAvaliacao { get; set; }
    public int NumeroAvaliadoresPorSubmissao { get; set; }
    public bool AvaliacaoDuploCego { get; set; } = true;

    // Relacionamento Inverso: 1 ConfiguracaoEvento -> 1 Evento
    public Evento Evento { get; set; }
}