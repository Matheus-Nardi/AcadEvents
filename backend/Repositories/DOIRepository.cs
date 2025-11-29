using AcadEvents.Data;
using AcadEvents.Models;
using Microsoft.EntityFrameworkCore;

namespace AcadEvents.Repositories;

public class DOIRepository : BaseRepository<DOI>
{
    public DOIRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<DOI?> FindByCodigoAsync(string codigo, CancellationToken cancellationToken = default)
    {
        return await _db.Set<DOI>()
            .FirstOrDefaultAsync(d => d.Codigo == codigo, cancellationToken);
    }
}

