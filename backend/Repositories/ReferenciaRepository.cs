using AcadEvents.Data;
using AcadEvents.Models;
using Microsoft.EntityFrameworkCore;

namespace AcadEvents.Repositories;

public class ReferenciaRepository : BaseRepository<Referencia>
{
    public ReferenciaRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<List<Referencia>> FindBySubmissaoIdAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Referencia>()
            .Include(r => r.DOI)
            .Where(r => r.SubmissaoId == submissaoId)
            .OrderBy(r => r.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<Referencia?> FindByIdWithDOIAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Referencia>()
            .Include(r => r.DOI)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }
}

