namespace AcadEvents.Models;

public class Usuario : DefaultModel
{
    public string Nome { get; set; }
    public string Email { get; set; }
    public string Senha { get; set; }
    public string Instituicao { get; set; }
    public string Pais { get; set; }
    public DateTime DataCadastro { get; set; }
    public bool Ativo { get; set; }

    // Relacionamento: 1 Usuario -> 0..1 PerfilORCID
    public long? PerfilORCIDId { get; set; }
    public PerfilORCID? PerfilORCID { get; set; }

    // Relacionamento: 1 Usuario -> * Notificacao
    public ICollection<Notificacao> Notificacoes { get; set; } = new List<Notificacao>();

    // Relacionamento: 1 Usuario -> * HistoricoEvento
    public ICollection<HistoricoEvento> Historicos { get; set; } = new List<HistoricoEvento>();
}