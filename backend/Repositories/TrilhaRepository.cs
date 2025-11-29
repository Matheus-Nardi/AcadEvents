using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class TrilhaRepository : BaseRepository<Trilha>
{
    public TrilhaRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<List<Trilha>> FindAllWithEventosAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Set<Trilha>()
            .Include(t => t.Eventos)
            .ToListAsync(cancellationToken);
    }

    public async Task<Trilha?> FindByIdWithEventosAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Trilha>()
            .Include(t => t.Eventos)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }
}

