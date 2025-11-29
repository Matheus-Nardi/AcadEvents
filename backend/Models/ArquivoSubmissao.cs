namespace AcadEvents.Models;

public class ArquivoSubmissao : DefaultModel
{
    public string NomeArquivo { get; set; }
    public long Tamanho { get; set; }
    public string Tipo { get; set; }
    public string Caminho { get; set; }
    public DateTime DataUpload { get; set; }
    public int Versao { get; set; }

    // Relacionamento Inverso: 1 ArquivoSubmissao -> 1 Submissao
    public long SubmissaoId { get; set; }
    public Submissao Submissao { get; set; }
}