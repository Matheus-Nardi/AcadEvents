using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;

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

    public async Task<TrilhaTematica?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _trilhaTematicaRepository.FindByIdAsync(id, cancellationToken);
    }

    public async Task<TrilhaTematica> CreateAsync(long trilhaId, TrilhaTematicaRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se a trilha existe
        var trilha = await _trilhaRepository.FindByIdAsync(trilhaId, cancellationToken);
        if (trilha == null)
            throw new ArgumentException($"Trilha com Id {trilhaId} não encontrada.");

        var trilhaTematica = new TrilhaTematica
        {
            Nome = request.Nome,
            Descricao = request.Descricao,
            PalavrasChave = request.PalavrasChave ?? new List<string>(),
            TrilhaId = trilhaId
        };

        return await _trilhaTematicaRepository.CreateAsync(trilhaTematica, cancellationToken);
    }

    public async Task<TrilhaTematica?> UpdateAsync(long id, TrilhaTematicaRequestDTO request, CancellationToken cancellationToken = default)
    {
        var trilhaTematica = await _trilhaTematicaRepository.FindByIdAsync(id, cancellationToken);
        if (trilhaTematica == null)
            return null;

        trilhaTematica.Nome = request.Nome;
        trilhaTematica.Descricao = request.Descricao;
        trilhaTematica.PalavrasChave = request.PalavrasChave ?? new List<string>();

        return await _trilhaTematicaRepository.UpdateAsync(trilhaTematica, cancellationToken);
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _trilhaTematicaRepository.DeleteAsync(id, cancellationToken);
    }
}

