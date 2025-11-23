using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;

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

    public async Task<Trilha?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _trilhaRepository.FindByIdWithEventosAsync(id, cancellationToken);
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
            throw new ArgumentException($"Trilha com Id {trilhaId} não encontrada.");

        // Verificar se o evento existe
        var evento = await _eventoRepository.FindByIdAsync(eventoId, cancellationToken);
        if (evento == null)
            throw new ArgumentException($"Evento com Id {eventoId} não encontrado.");

        // Verificar se já está associado
        if (trilha.Eventos.Any(e => e.Id == eventoId))
        {
            throw new ArgumentException($"A trilha {trilhaId} já está associada ao evento {eventoId}.");
        }

        trilha.Eventos.Add(evento);
        return await _trilhaRepository.UpdateAsync(trilha, cancellationToken);
    }

    public async Task<Trilha> RemoveFromEventoAsync(long trilhaId, long eventoId, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdWithEventosAsync(trilhaId, cancellationToken);
        if (trilha == null)
            throw new ArgumentException($"Trilha com Id {trilhaId} não encontrada.");

        var evento = trilha.Eventos.FirstOrDefault(e => e.Id == eventoId);
        if (evento == null)
        {
            throw new ArgumentException($"A trilha {trilhaId} não está associada ao evento {eventoId}.");
        }

        trilha.Eventos.Remove(evento);
        return await _trilhaRepository.UpdateAsync(trilha, cancellationToken);
    }

    public async Task<Trilha?> UpdateAsync(long id, TrilhaRequestDTO request, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdAsync(id, cancellationToken);
        if (trilha == null)
            return null;

        trilha.Nome = request.Nome;
        trilha.Descricao = request.Descricao;
        trilha.Coordenador = request.Coordenador;

        return await _trilhaRepository.UpdateAsync(trilha, cancellationToken);
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _trilhaRepository.DeleteAsync(id, cancellationToken);
    }
}

