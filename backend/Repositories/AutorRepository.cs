using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class AutorRepository : BaseRepository<Autor>
{
    public AutorRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<Autor?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Autor>()
            .FirstOrDefaultAsync(a => a.Email == email, cancellationToken);
    }
}

