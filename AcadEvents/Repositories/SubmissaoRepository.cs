using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class SubmissaoRepository : BaseRepository<Submissao>
{
    public SubmissaoRepository(AcadEventsDbContext db) : base(db) { }
}

