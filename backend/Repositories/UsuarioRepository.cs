using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class UsuarioRepository : BaseRepository<Usuario>
{
    public UsuarioRepository(AcadEventsDbContext db) : base(db) { }
}

