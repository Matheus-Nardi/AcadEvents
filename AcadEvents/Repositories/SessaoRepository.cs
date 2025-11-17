using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class SessaoRepository : BaseRepository<Sessao>
{
    public SessaoRepository(AcadEventsDbContext db) : base(db) { }
}

