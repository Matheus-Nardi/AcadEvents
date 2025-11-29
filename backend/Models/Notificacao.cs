namespace AcadEvents.Models;

public class Notificacao : DefaultModel
{
    public string Titulo { get; set; }
    public string Mensagem { get; set; }
    public string Tipo { get; set; }
    public DateTime DataEnvio { get; set; }
    public bool Lida { get; set; }
    public string Prioridade { get; set; }

    // Relacionamento Inverso: 1 Notificacao -> 1 Usuario
    public long UsuarioId { get; set; }
    public Usuario Usuario { get; set; }
}