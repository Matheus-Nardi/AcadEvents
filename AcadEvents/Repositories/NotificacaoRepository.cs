using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class NotificacaoRepository : BaseRepository<Notificacao>
{
    public NotificacaoRepository(AcadEventsDbContext db) : base(db) { }
}

