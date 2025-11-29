namespace AcadEvents.Models;

public class Autor : Usuario
{
    public string Biografia { get; set; }
    public string AreaAtuacao { get; set; }
    public string Lattes { get; set; }

    // Relacionamento: 1 Autor -> * Submissao
    public ICollection<Submissao> Submissoes { get; set; } = new List<Submissao>();
}