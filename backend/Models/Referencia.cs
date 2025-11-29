namespace AcadEvents.Models;

public class Referencia : DefaultModel
{
    public string Autores { get; set; }
    public string Titulo { get; set; }
    public int Ano { get; set; }
    public string Publicacao { get; set; }

    // Campos adicionais do Crossref
    public string? Abstract { get; set; }
    public string? TipoPublicacao { get; set; }
    public string? Publisher { get; set; }

    // Relacionamento Inverso: 1 Referencia -> 1 Submissao
    public long SubmissaoId { get; set; }
    public Submissao Submissao { get; set; }

    // Relacionamento: 1 Referencia -> 0..1 DOI
    public long? DOIId { get; set; }
    public DOI? DOI { get; set; }
}