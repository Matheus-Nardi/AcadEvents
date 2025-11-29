namespace AcadEvents.Models;

public class HistoricoEvento : DefaultModel
{
    public string Acao { get; set; }
    public string Descricao { get; set; }
    public DateTime DataHora { get; set; }
    public string Detalhes { get; set; }
    // O UML tinha "usuarioResponsavel: String", mas o relacionamento
    // "Usuario 1 -> * HistoricoEvento" é mais forte.
    
    // Relacionamento Inverso: 1 Historico -> 1 Usuario
    public long UsuarioId { get; set; }
    public Usuario Usuario { get; set; }

    // Relacionamento Inverso: 1 Historico -> 1 Evento
    public long EventoId { get; set; }
    public Evento Evento { get; set; }
}