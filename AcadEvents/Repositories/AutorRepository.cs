using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class AutorRepository : BaseRepository<Autor>
{
    public AutorRepository(AcadEventsDbContext db) : base(db) { }
}

