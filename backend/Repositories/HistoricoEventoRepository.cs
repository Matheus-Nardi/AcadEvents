using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class HistoricoEventoRepository : BaseRepository<HistoricoEvento>
{
    public HistoricoEventoRepository(AcadEventsDbContext db) : base(db) { }
}

