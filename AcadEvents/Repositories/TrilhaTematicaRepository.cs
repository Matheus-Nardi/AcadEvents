using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class TrilhaTematicaRepository : BaseRepository<TrilhaTematica>
{
    public TrilhaTematicaRepository(AcadEventsDbContext db) : base(db) { }
}

