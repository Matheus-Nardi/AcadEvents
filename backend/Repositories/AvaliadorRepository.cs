using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class AvaliadorRepository : BaseRepository<Avaliador>
{
    public AvaliadorRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<Avaliador?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Avaliador>()
            .FirstOrDefaultAsync(a => a.Email == email, cancellationToken);
    }
}

