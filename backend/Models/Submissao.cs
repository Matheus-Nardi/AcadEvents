namespace AcadEvents.Models;

public class Submissao : DefaultModel
{
    public string Titulo { get; set; }
    public string Resumo { get; set; }
    public List<string> PalavrasChave { get; set; } = new List<string>();
    public DateTime DataSubmissao { get; set; }
    public DateTime DataUltimaModificacao { get; set; }
    public int Versao { get; set; }

    // Enums
    public StatusSubmissao Status { get; set; }
    public FormatoSubmissao Formato { get; set; }

    // Relacionamento Inverso: 1 Submissao -> 1 Autor
    public long AutorId { get; set; }
    public Autor Autor { get; set; }

    // Relacionamento Inverso: 1 Submissao -> 1 Evento
    public long EventoId { get; set; }
    public Evento Evento { get; set; }

    // Relacionamento Inverso: 1 Submissao -> 1 TrilhaTematica
    public long TrilhaTematicaId { get; set; }
    public TrilhaTematica TrilhaTematica { get; set; }

    // Relacionamento: 1 Submissao -> 0..1 Sessao
    public long? SessaoId { get; set; }
    public Sessao? Sessao { get; set; }

    // Relacionamento: 1 Submissao -> 0..1 DOI
    public long? DOIId { get; set; }
    public DOI? DOI { get; set; }

    // Relacionamento: 1 Submissao -> 1..* ArquivoSubmissao
    public ICollection<ArquivoSubmissao> Arquivos { get; set; } = new List<ArquivoSubmissao>();

    // Relacionamento: 1 Submissao -> * Referencia
    public ICollection<Referencia> Referencias { get; set; } = new List<Referencia>();

    // Relacionamento: 1 Submissao -> * Avaliacao
    public ICollection<Avaliacao> Avaliacoes { get; set; } = new List<Avaliacao>();

    // Relacionamento Inverso: 1 Submissao -> * ConviteAvaliacao
    public ICollection<ConviteAvaliacao> Convites { get; set; } = new List<ConviteAvaliacao>();
}