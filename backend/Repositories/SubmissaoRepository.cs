using AcadEvents.Data;
using AcadEvents.Models;
using Microsoft.EntityFrameworkCore;

namespace AcadEvents.Repositories;

public class SubmissaoRepository : BaseRepository<Submissao>
{
    public SubmissaoRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<Submissao?> FindByIdWithEventoAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _db.Submissoes
            .Include(s => s.Evento)
            .Include(s => s.TrilhaTematica)
                .ThenInclude(tt => tt.Trilha)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<List<Submissao>> FindByTrilhaTematicaIdAsync(long trilhaTematicaId, CancellationToken cancellationToken = default)
    {
        return await _db.Submissoes
            .Include(s => s.Autor)
            .Include(s => s.Evento)
            .Include(s => s.TrilhaTematica)
            .Where(s => s.TrilhaTematicaId == trilhaTematicaId)
            .OrderByDescending(s => s.DataSubmissao)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Submissao>> FindByAutorIdAsync(long autorId, CancellationToken cancellationToken = default)
    {
        return await _db.Submissoes
            .Include(s => s.Autor)
            .Include(s => s.Evento)
            .Include(s => s.TrilhaTematica)
            .Where(s => s.AutorId == autorId)
            .OrderByDescending(s => s.DataSubmissao)
            .ToListAsync(cancellationToken);
    }

    public async Task<Submissao?> FindByIdWithRelacionamentosAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _db.Submissoes
            .Include(s => s.Autor)
            .Include(s => s.Evento)
            .Include(s => s.TrilhaTematica)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<List<Submissao>> FindForAvaliadorAvaliacaoAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _db.Submissoes
            .Include(s => s.Autor)
            .Include(s => s.Evento)
            .Include(s => s.TrilhaTematica)
            .Where(s => s.Convites
                .Any(c => c.AvaliadorId == avaliadorId && c.Aceito == true))
            .OrderByDescending(s => s.DataSubmissao)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Submissao>> FindByEventoIdAsync(long eventoId, CancellationToken cancellationToken = default)
    {
        return await _db.Submissoes
            .Where(s => s.EventoId == eventoId)
            .ToListAsync(cancellationToken);
    }
}

