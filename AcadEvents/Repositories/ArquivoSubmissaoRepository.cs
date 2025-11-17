using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class ArquivoSubmissaoRepository : BaseRepository<ArquivoSubmissao>
{
    public ArquivoSubmissaoRepository(AcadEventsDbContext db) : base(db) { }
}

