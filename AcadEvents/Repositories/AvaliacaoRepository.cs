using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class AvaliacaoRepository : BaseRepository<Avaliacao>
{
    public AvaliacaoRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<List<Avaliacao>> FindByAvaliadorIdAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Avaliacao>()
            .Where(a => a.AvaliadorId == avaliadorId)
            .OrderByDescending(a => a.DataCriacao)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Avaliacao>> FindBySubmissaoIdAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<Avaliacao>()
            .Where(a => a.SubmissaoId == submissaoId)
            .OrderByDescending(a => a.DataCriacao)
            .ToListAsync(cancellationToken);
    }
}

