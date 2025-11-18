using AcadEvents.Models;
using AcadEvents.Repositories;

namespace AcadEvents.Services;

public class AvaliacaoService
{
    private readonly AvaliacaoRepository _repository;

    public AvaliacaoService(AvaliacaoRepository repository)
    {
        _repository = repository;
    }

    public async Task<Avaliacao?> FindByIdAsync(long id)
    {
        return await _repository.FindByIdAsync(id);
    }

    public async Task<List<Avaliacao>> FindAllAsync()
    {
        return await _repository.FindAllAsync();
    }

    public async Task<List<Avaliacao>> FindByAvaliadorIdAsync(long avaliadorId)
    {
        return await _repository.FindByAvaliadorIdAsync(avaliadorId);
    }
}