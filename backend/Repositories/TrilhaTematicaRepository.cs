using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class TrilhaTematicaRepository : BaseRepository<TrilhaTematica>
{
    public TrilhaTematicaRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<List<TrilhaTematica>> FindByTrilhaIdAsync(long trilhaId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<TrilhaTematica>()
            .Where(tt => tt.TrilhaId == trilhaId)
            .ToListAsync(cancellationToken);
    }
}

