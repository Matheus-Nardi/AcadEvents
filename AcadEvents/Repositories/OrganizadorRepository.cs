using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class OrganizadorRepository : BaseRepository<Organizador>
{
    public OrganizadorRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<Organizador?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Organizador>()
            .FirstOrDefaultAsync(o => o.Email == email, cancellationToken);
    }
}

