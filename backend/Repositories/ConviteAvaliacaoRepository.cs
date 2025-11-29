using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public enum StatusConvite
{
    Todos,
    Pendentes,
    Aceitos,
    Recusados
}

public class ConviteAvaliacaoRepository : BaseRepository<ConviteAvaliacao>
{
    public ConviteAvaliacaoRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorIdAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<ConviteAvaliacao>()
            .Where(c => c.AvaliadorId == avaliadorId)
            .OrderByDescending(c => c.DataConvite)
            .ToListAsync(cancellationToken);
    }

    public async Task<ConviteAvaliacao?> AceitarConviteAsync(long conviteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        var convite = await _db.Set<ConviteAvaliacao>()
            .FirstOrDefaultAsync(c => c.Id == conviteId && c.AvaliadorId == avaliadorId, cancellationToken);

        if (convite is null || convite.Aceito.HasValue)
        {
            return null;
        }

        convite.Aceito = true;
        convite.DataResposta = DateTime.UtcNow;
        
        await _db.SaveChangesAsync(cancellationToken);
        return convite;
    }

    public async Task<ConviteAvaliacao?> RecusarConviteAsync(long conviteId, long avaliadorId, string motivoRecusa, CancellationToken cancellationToken = default)
    {
        var convite = await _db.Set<ConviteAvaliacao>()
            .FirstOrDefaultAsync(c => c.Id == conviteId && c.AvaliadorId == avaliadorId, cancellationToken);

        if (convite is null || convite.Aceito.HasValue)
        {
            return null;
        }

        convite.Aceito = false;
        convite.DataResposta = DateTime.UtcNow;
        convite.MotivoRecusa = motivoRecusa;
        
        await _db.SaveChangesAsync(cancellationToken);
        return convite;
    }

    public async Task<bool> ExisteConviteAceitoAsync(long avaliadorId, long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<ConviteAvaliacao>()
            .AnyAsync(c => c.AvaliadorId == avaliadorId 
                && c.SubmissaoId == submissaoId 
                && c.Aceito == true, cancellationToken);
    }

    public async Task<ConviteAvaliacao?> FindByIdWithRelacionamentosAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _db.Set<ConviteAvaliacao>()
            .Include(c => c.Avaliador)
            .Include(c => c.Submissao)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> FindBySubmissaoIdAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<ConviteAvaliacao>()
            .Include(c => c.Avaliador)
            .Include(c => c.Submissao)
            .Where(c => c.SubmissaoId == submissaoId)
            .OrderByDescending(c => c.DataConvite)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> CreateBulkAsync(List<ConviteAvaliacao> convites, CancellationToken cancellationToken = default)
    {
        await _db.Set<ConviteAvaliacao>().AddRangeAsync(convites, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return convites;
    }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorWhereResponseIsNullAsync(long avaliadorId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Set<ConviteAvaliacao>().Include(c => c.Avaliador)
            .Where(c => c.AvaliadorId == avaliadorId)
            .Where(c => c.Aceito == null)
            .OrderByDescending(c => c.DataConvite)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExisteConviteAsync(long avaliadorId, long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _db.Set<ConviteAvaliacao>()
            .AnyAsync(c => c.AvaliadorId == avaliadorId && c.SubmissaoId == submissaoId, cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorComFiltroAsync(long avaliadorId, StatusConvite status, CancellationToken cancellationToken = default)
    {
        var query = _db.Set<ConviteAvaliacao>()
            .Where(c => c.AvaliadorId == avaliadorId);

        query = status switch
        {
            StatusConvite.Pendentes => query.Where(c => c.Aceito == null),
            StatusConvite.Aceitos => query.Where(c => c.Aceito == true),
            StatusConvite.Recusados => query.Where(c => c.Aceito == false),
            _ => query // Todos
        };

        return await query
            .OrderByDescending(c => c.DataConvite)
            .ToListAsync(cancellationToken);
    }
}

