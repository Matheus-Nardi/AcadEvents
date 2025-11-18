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
        return await _trilhaRepository.FindAllAsync(cancellationToken);
    }

    public async Task<Trilha?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _trilhaRepository.FindByIdAsync(id, cancellationToken);
    }

    public async Task<Trilha> CreateAsync(long eventoId, TrilhaRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se o evento existe
        var evento = await _eventoRepository.FindByIdAsync(eventoId, cancellationToken);
        if (evento == null)
            throw new ArgumentException($"Evento com Id {eventoId} não encontrado.");

        var trilha = new Trilha
        {
            Nome = request.Nome,
            Descricao = request.Descricao,
            Coordenador = request.Coordenador,
            LimiteSubmissoes = request.LimiteSubmissoes,
            EventoId = eventoId
        };

        return await _trilhaRepository.CreateAsync(trilha, cancellationToken);
    }

    public async Task<Trilha?> UpdateAsync(long id, TrilhaRequestDTO request, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaRepository.FindByIdAsync(id, cancellationToken);
        if (trilha == null)
            return null;

        trilha.Nome = request.Nome;
        trilha.Descricao = request.Descricao;
        trilha.Coordenador = request.Coordenador;
        trilha.LimiteSubmissoes = request.LimiteSubmissoes;

        return await _trilhaRepository.UpdateAsync(trilha, cancellationToken);
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _trilhaRepository.DeleteAsync(id, cancellationToken);
    }
}

