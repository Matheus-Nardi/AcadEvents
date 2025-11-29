namespace AcadEvents.Models;

public class PerfilORCID : DefaultModel
{
    public string OrcidId { get; set; }
    public string NomeCompleto { get; set; }
    public List<string> Publicacoes { get; set; } = new List<string>();
    public bool Verificado { get; set; }

    // Relacionamento Inverso: 1 PerfilORCID -> 1 Usuario
    public long UsuarioId { get; set; }
    public Usuario Usuario { get; set; }
}