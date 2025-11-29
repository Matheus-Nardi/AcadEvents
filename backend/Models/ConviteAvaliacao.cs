namespace AcadEvents.Models;

public class ConviteAvaliacao : DefaultModel
{
    public DateTime DataConvite { get; set; }
    public DateTime? DataResposta { get; set; }
    public DateTime PrazoAvaliacao { get; set; }
    public bool? Aceito { get; set; }
    public string MotivoRecusa { get; set; }

    // Relacionamento Inverso: 1 Convite -> 1 Avaliador
    public long AvaliadorId { get; set; }
    public Avaliador Avaliador { get; set; }

    // Relacionamento: 1 Convite -> 1 Submissao
    public long SubmissaoId { get; set; }
    public Submissao Submissao { get; set; }
}