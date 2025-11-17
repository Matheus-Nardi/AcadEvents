using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class AvaliacaoRepository : BaseRepository<Avaliacao>
{
    public AvaliacaoRepository(AcadEventsDbContext db) : base(db) { }
}

