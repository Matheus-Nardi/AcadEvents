using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class EventoRepository : BaseRepository<Evento>
{
    public EventoRepository(AcadEventsDbContext db) : base(db) { }
}

