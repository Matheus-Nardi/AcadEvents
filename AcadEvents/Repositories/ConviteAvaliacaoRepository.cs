using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class ConviteAvaliacaoRepository : BaseRepository<ConviteAvaliacao>
{
    public ConviteAvaliacaoRepository(AcadEventsDbContext db) : base(db) { }
}

