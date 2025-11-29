namespace AcadEvents.Models;

public class ConfiguracaoEvento : DefaultModel
{
    public DateTime PrazoSubmissao { get; set; }
    public DateTime PrazoAvaliacao { get; set; }
    public int NumeroAvaliadoresPorSubmissao { get; set; }
    public bool AvaliacaoDuploCego { get; set; }
    public bool PermiteResubmissao { get; set; }

    // Relacionamento Inverso: 1 ConfiguracaoEvento -> 1 Evento
    public Evento Evento { get; set; }
}