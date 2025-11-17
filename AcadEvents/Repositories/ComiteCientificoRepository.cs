using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class ComiteCientificoRepository : BaseRepository<ComiteCientifico>
{
    public ComiteCientificoRepository(AcadEventsDbContext db) : base(db) { }
}

