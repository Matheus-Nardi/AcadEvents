using AcadEvents.Data;
using AcadEvents.Models;
using Microsoft.EntityFrameworkCore;

namespace AcadEvents.Repositories;

public class ComiteCientificoRepository : BaseRepository<ComiteCientifico>
{
    public ComiteCientificoRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<List<ComiteCientifico>> FindAllWithRelacionamentosAsync(CancellationToken cancellationToken = default)
    {
        return await _db.ComitesCientificos
            .Include(c => c.MembrosAvaliadores)
            .Include(c => c.Coordenadores)
            .ToListAsync(cancellationToken);
    }

    public async Task<ComiteCientifico?> FindByIdWithRelacionamentosAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _db.ComitesCientificos
            .Include(c => c.MembrosAvaliadores)
            .Include(c => c.Coordenadores)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task AddAvaliadorAsync(long comiteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        var comite = await FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        if (comite == null)
            throw new ArgumentException($"Comitê Científico com Id {comiteId} não encontrado.");

        var avaliador = await _db.Avaliadores.FindAsync(new object[] { avaliadorId }, cancellationToken);
        if (avaliador == null)
            throw new ArgumentException($"Avaliador com Id {avaliadorId} não encontrado.");

        if (!comite.MembrosAvaliadores.Contains(avaliador))
        {
            comite.MembrosAvaliadores.Add(avaliador);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task RemoveAvaliadorAsync(long comiteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        var comite = await FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        if (comite == null)
            throw new ArgumentException($"Comitê Científico com Id {comiteId} não encontrado.");

        var avaliador = comite.MembrosAvaliadores.FirstOrDefault(a => a.Id == avaliadorId);
        if (avaliador != null)
        {
            comite.MembrosAvaliadores.Remove(avaliador);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task AddCoordenadorAsync(long comiteId, long organizadorId, CancellationToken cancellationToken = default)
    {
        var comite = await FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        if (comite == null)
            throw new ArgumentException($"Comitê Científico com Id {comiteId} não encontrado.");

        var organizador = await _db.Organizadores.FindAsync(new object[] { organizadorId }, cancellationToken);
        if (organizador == null)
            throw new ArgumentException($"Organizador com Id {organizadorId} não encontrado.");

        if (!comite.Coordenadores.Contains(organizador))
        {
            comite.Coordenadores.Add(organizador);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task RemoveCoordenadorAsync(long comiteId, long organizadorId, CancellationToken cancellationToken = default)
    {
        var comite = await FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        if (comite == null)
            throw new ArgumentException($"Comitê Científico com Id {comiteId} não encontrado.");

        var organizador = comite.Coordenadores.FirstOrDefault(o => o.Id == organizadorId);
        if (organizador != null)
        {
            comite.Coordenadores.Remove(organizador);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> AvaliadorFazParteDoComiteDoEventoAsync(long avaliadorId, long eventoId, CancellationToken cancellationToken = default)
    {
        return await _db.ComitesCientificos
            .Where(c => c.EventoId == eventoId)
            .Include(c => c.MembrosAvaliadores)
            .AnyAsync(c => c.MembrosAvaliadores.Any(a => a.Id == avaliadorId), cancellationToken);
    }

    public async Task<List<Avaliador>> FindAvaliadoresDoComiteDoEventoAsync(long eventoId, CancellationToken cancellationToken = default)
    {
        var comites = await _db.ComitesCientificos
            .Where(c => c.EventoId == eventoId)
            .Include(c => c.MembrosAvaliadores)
            .ToListAsync(cancellationToken);

        var avaliadores = comites
            .SelectMany(c => c.MembrosAvaliadores)
            .Distinct()
            .ToList();

        return avaliadores;
    }
}