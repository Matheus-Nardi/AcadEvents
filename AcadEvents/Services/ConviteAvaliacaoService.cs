using AcadEvents.Models;
using AcadEvents.Repositories;

namespace AcadEvents.Services;

public class ConviteAvaliacaoService
{
    private readonly ConviteAvaliacaoRepository _repository;

    public ConviteAvaliacaoService(ConviteAvaliacaoRepository repository)
    {
        _repository = repository;
    }

    public async Task<ConviteAvaliacao?> FindByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByIdAsync(id, cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorIdAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorIdAsync(avaliadorId, cancellationToken);
    }

    public async Task<ConviteAvaliacao?> AceitarConviteAsync(long conviteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _repository.AceitarConviteAsync(conviteId, avaliadorId, cancellationToken);
    }

    public async Task<ConviteAvaliacao?> RecusarConviteAsync(long conviteId, long avaliadorId, string motivoRecusa, CancellationToken cancellationToken = default)
    {
        return await _repository.RecusarConviteAsync(conviteId, avaliadorId, motivoRecusa, cancellationToken);
    }
}

