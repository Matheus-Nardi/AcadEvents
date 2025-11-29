namespace AcadEvents.Models;

public class Avaliador : Usuario
{
    public List<string> Especialidades { get; set; } = new List<string>();
    public int NumeroAvaliacoes { get; set; }
    public bool Disponibilidade { get; set; }

    // Relacionamento: 1 Avaliador -> * ConviteAvaliacao
    public ICollection<ConviteAvaliacao> ConvitesRecebidos { get; set; } = new List<ConviteAvaliacao>();

    // Relacionamento: 1 Avaliador -> * Avaliacao
    public ICollection<Avaliacao> AvaliacoesRealizadas { get; set; } = new List<Avaliacao>();

    // Relacionamento: * Avaliador <-> * ComiteCientifico
    public ICollection<ComiteCientifico> Comites { get; set; } = new List<ComiteCientifico>();
}