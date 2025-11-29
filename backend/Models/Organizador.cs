namespace AcadEvents.Models;

public class Organizador : Usuario
{
    public string Cargo { get; set; }
    public List<string> Permissoes { get; set; } = new List<string>();

    // Relacionamento: * Organizador <-> * Evento
    public ICollection<Evento> EventosOrganizados { get; set; } = new List<Evento>();

    // Relacionamento: * Organizador <-> * ComiteCientifico
    public ICollection<ComiteCientifico> ComitesCoordenados { get; set; } = new List<ComiteCientifico>();
}