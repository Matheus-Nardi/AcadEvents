using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class PerfilORCIDRepository : BaseRepository<PerfilORCID>
{
    public PerfilORCIDRepository(AcadEventsDbContext db) : base(db) { }
}

