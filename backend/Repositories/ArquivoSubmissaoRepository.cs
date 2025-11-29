using AcadEvents.Data;
using AcadEvents.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace AcadEvents.Repositories;

public class ArquivoSubmissaoRepository : BaseRepository<ArquivoSubmissao>
{
    public ArquivoSubmissaoRepository(AcadEventsDbContext db) : base(db) { }

    public Task<List<ArquivoSubmissao>> FindBySubmissaoIdAsync(long submissaoId, CancellationToken cancellationToken = default)
        => _db.ArquivosSubmissao
            .Where(a => a.SubmissaoId == submissaoId)
            .OrderByDescending(a => a.Versao)
            .ToListAsync(cancellationToken);

    public async Task<int> ObterProximaVersaoAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        var total = await _db.ArquivosSubmissao
            .Where(a => a.SubmissaoId == submissaoId)
            .CountAsync(cancellationToken);

        return total + 1;
    }
}

