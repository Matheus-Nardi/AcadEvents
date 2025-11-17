using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class ReferenciaRepository : BaseRepository<Referencia>
{
    public ReferenciaRepository(AcadEventsDbContext db) : base(db) { }
}

