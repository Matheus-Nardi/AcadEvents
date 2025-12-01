using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Exceptions;

namespace AcadEvents.Services;

public class TrilhaService
{
    private readonly TrilhaRepository _trilhaRepository;
    private readonly EventoRepository _eventoRepository;

    public TrilhaService(
        TrilhaRepository trilhaRepository,
        EventoRepository eventoRepository)
    {
        _trilhaRepository = trilhaRepository;
        _eventoRepository = eventoRepository;
    }

    public async Task<List<Trilha>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _trilhaRepository.FindAllWithEventosAsync(cancellationToken);
    }

    public async Task<Trilha> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdWithEventosAsync(id, cancellationToken);
        if (trilha == null)
            throw new NotFoundException("Trilha", id);
        return trilha;
    }

    public async Task<Trilha> CreateAsync(TrilhaRequestDTO request, CancellationToken cancellationToken = default)
    {
        var trilha = new Trilha
        {
            Nome = request.Nome,
            Descricao = request.Descricao,
            Coordenador = request.Coordenador
        };

        return await _trilhaRepository.CreateAsync(trilha, cancellationToken);
    }

    public async Task<Trilha> AssociateToEventoAsync(long trilhaId, long eventoId, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdWithEventosAsync(trilhaId, cancellationToken);
        if (trilha == null)
            throw new NotFoundException("Trilha", trilhaId);

        // Verificar se o evento existe
        var evento = await _eventoRepository.FindByIdAsync(eventoId, cancellationToken);
        if (evento == null)
            throw new NotFoundException("Evento", eventoId);

        // Verificar se já está associado
        if (trilha.Eventos.Any(e => e.Id == eventoId))
        {
            throw new ConflictException($"A trilha {trilhaId} já está associada ao evento {eventoId}.");
        }

        trilha.Eventos.Add(evento);
        return await _trilhaRepository.UpdateAsync(trilha, cancellationToken);
    }

    public async Task<Trilha> RemoveFromEventoAsync(long trilhaId, long eventoId, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdWithEventosAsync(trilhaId, cancellationToken);
        if (trilha == null)
            throw new NotFoundException("Trilha", trilhaId);

        var evento = trilha.Eventos.FirstOrDefault(e => e.Id == eventoId);
        if (evento == null)
        {
            throw new NotFoundException($"A trilha {trilhaId} não está associada ao evento {eventoId}.");
        }

        trilha.Eventos.Remove(evento);
        return await _trilhaRepository.UpdateAsync(trilha, cancellationToken);
    }

    public async Task<Trilha> UpdateAsync(long id, TrilhaRequestDTO request, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdAsync(id, cancellationToken);
        if (trilha == null)
            throw new NotFoundException("Trilha", id);

        trilha.Nome = request.Nome;
        trilha.Descricao = request.Descricao;
        trilha.Coordenador = request.Coordenador;

        return await _trilhaRepository.UpdateAsync(trilha, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdAsync(id, cancellationToken);
        if (trilha == null)
            throw new NotFoundException("Trilha", id);
            
        await _trilhaRepository.DeleteAsync(id, cancellationToken);
    }
}

