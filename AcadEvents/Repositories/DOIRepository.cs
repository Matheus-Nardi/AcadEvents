using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class DOIRepository : BaseRepository<DOI>
{
    public DOIRepository(AcadEventsDbContext db) : base(db) { }
}

