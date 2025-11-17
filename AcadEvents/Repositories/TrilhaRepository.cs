using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class TrilhaRepository : BaseRepository<Trilha>
{
    public TrilhaRepository(AcadEventsDbContext db) : base(db) { }
}

