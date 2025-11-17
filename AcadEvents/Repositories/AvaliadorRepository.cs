using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class AvaliadorRepository : BaseRepository<Avaliador>
{
    public AvaliadorRepository(AcadEventsDbContext db) : base(db) { }
}

