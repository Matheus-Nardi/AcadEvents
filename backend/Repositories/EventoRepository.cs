using AcadEvents.Data;
using AcadEvents.Models;
using Microsoft.EntityFrameworkCore;

namespace AcadEvents.Repositories;

public class EventoRepository : BaseRepository<Evento>
{
    public EventoRepository(AcadEventsDbContext db) : base(db) { }

    public async Task<List<Evento>> FindAllWithOrganizadoresAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Eventos
            .Include(e => e.Organizadores)
            .Include(e => e.Configuracao)
            .Include(e => e.Trilhas)
            .Include(e => e.Comites)
                .ThenInclude(c => c.MembrosAvaliadores)
            .Include(e => e.Comites)
                .ThenInclude(c => c.Coordenadores)
            .ToListAsync(cancellationToken);
    }

    public async Task<Evento?> FindByIdWithOrganizadoresAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _db.Eventos
            .Include(e => e.Organizadores)
            .Include(e => e.Configuracao)
            .Include(e => e.Trilhas)
            .Include(e => e.Comites)
                .ThenInclude(c => c.MembrosAvaliadores)
            .Include(e => e.Comites)
                .ThenInclude(c => c.Coordenadores)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<Evento?> FindByConfiguracaoEventoIdAsync(long configuracaoEventoId, CancellationToken cancellationToken = default)
    {
        return await _db.Eventos
            .FirstOrDefaultAsync(e => e.ConfiguracaoEventoId == configuracaoEventoId, cancellationToken);
    }

    public async Task<List<Evento>> FindByOrganizadorIdAsync(long organizadorId, CancellationToken cancellationToken = default)
    {
        return await _db.Eventos
            .Include(e => e.Organizadores)
            .Include(e => e.Configuracao)
            .Include(e => e.Trilhas)
            .Include(e => e.Comites)
                .ThenInclude(c => c.MembrosAvaliadores)
            .Include(e => e.Comites)
                .ThenInclude(c => c.Coordenadores)
            .Where(e => e.Organizadores.Any(o => o.Id == organizadorId))
            .ToListAsync(cancellationToken);
    }

    public async Task AddOrganizadorAsync(long eventoId, long organizadorId, CancellationToken cancellationToken = default)
    {
        var evento = await FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        if (evento == null)
            throw new ArgumentException($"Evento com Id {eventoId} não encontrado.");

        var organizador = await _db.Organizadores.FindAsync(new object[] { organizadorId }, cancellationToken);
        if (organizador == null)
            throw new ArgumentException($"Organizador com Id {organizadorId} não encontrado.");

        if (!evento.Organizadores.Contains(organizador))
        {
            evento.Organizadores.Add(organizador);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task RemoveOrganizadorAsync(long eventoId, long organizadorId, CancellationToken cancellationToken = default)
    {
        var evento = await FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        if (evento == null)
            throw new ArgumentException($"Evento com Id {eventoId} não encontrado.");

        var organizador = evento.Organizadores.FirstOrDefault(o => o.Id == organizadorId);
        if (organizador != null)
        {
            evento.Organizadores.Remove(organizador);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}

