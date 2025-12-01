using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Exceptions;

namespace AcadEvents.Services;

public class TrilhaTematicaService
{
    private readonly TrilhaTematicaRepository _trilhaTematicaRepository;
    private readonly TrilhaRepository _trilhaRepository;

    public TrilhaTematicaService(
        TrilhaTematicaRepository trilhaTematicaRepository,
        TrilhaRepository trilhaRepository)
    {
        _trilhaTematicaRepository = trilhaTematicaRepository;
        _trilhaRepository = trilhaRepository;
    }

    public async Task<List<TrilhaTematica>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _trilhaTematicaRepository.FindAllAsync(cancellationToken);
    }

    public async Task<TrilhaTematica> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var trilhaTematica = await _trilhaTematicaRepository.FindByIdAsync(id, cancellationToken);
        if (trilhaTematica == null)
            throw new NotFoundException("Trilha Temática", id);
        return trilhaTematica;
    }

    public async Task<List<TrilhaTematica>> GetByTrilhaIdAsync(long trilhaId, CancellationToken cancellationToken = default)
    {
        // Verificar se a trilha existe
        var trilha = await _trilhaRepository.FindByIdAsync(trilhaId, cancellationToken);
        if (trilha == null)
            throw new NotFoundException("Trilha", trilhaId);

        return await _trilhaTematicaRepository.FindByTrilhaIdAsync(trilhaId, cancellationToken);
    }

    public async Task<TrilhaTematica> CreateAsync(TrilhaTematicaRequestDTO request, CancellationToken cancellationToken = default)
    {
        var trilhaTematica = new TrilhaTematica
        {
            Nome = request.Nome,
            Descricao = request.Descricao,
            PalavrasChave = request.PalavrasChave ?? new List<string>(),
            TrilhaId = null
        };

        return await _trilhaTematicaRepository.CreateAsync(trilhaTematica, cancellationToken);
    }

    public async Task<TrilhaTematica> AssociateToTrilhaAsync(long trilhaTematicaId, long trilhaId, CancellationToken cancellationToken = default)
    {
        var trilhaTematica = await _trilhaTematicaRepository.FindByIdAsync(trilhaTematicaId, cancellationToken);
        if (trilhaTematica == null)
            throw new NotFoundException("Trilha Temática", trilhaTematicaId);

        // Verificar se a trilha existe
        var trilha = await _trilhaRepository.FindByIdAsync(trilhaId, cancellationToken);
        if (trilha == null)
            throw new NotFoundException("Trilha", trilhaId);

        trilhaTematica.TrilhaId = trilhaId;
        return await _trilhaTematicaRepository.UpdateAsync(trilhaTematica, cancellationToken);
    }

    public async Task<TrilhaTematica> UpdateAsync(long id, TrilhaTematicaRequestDTO request, CancellationToken cancellationToken = default)
    {
        var trilhaTematica = await _trilhaTematicaRepository.FindByIdAsync(id, cancellationToken);
        if (trilhaTematica == null)
            throw new NotFoundException("Trilha Temática", id);

        trilhaTematica.Nome = request.Nome;
        trilhaTematica.Descricao = request.Descricao;
        trilhaTematica.PalavrasChave = request.PalavrasChave ?? new List<string>();

        return await _trilhaTematicaRepository.UpdateAsync(trilhaTematica, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var trilhaTematica = await _trilhaTematicaRepository.FindByIdAsync(id, cancellationToken);
        if (trilhaTematica == null)
            throw new NotFoundException("Trilha Temática", id);
            
        await _trilhaTematicaRepository.DeleteAsync(id, cancellationToken);
    }
}

