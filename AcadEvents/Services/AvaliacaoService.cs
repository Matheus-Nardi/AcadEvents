using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Dtos;

namespace AcadEvents.Services;

public class AvaliacaoService
{
    private readonly AvaliacaoRepository _repository;
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly AvaliadorRepository _avaliadorRepository;

    public AvaliacaoService(
        AvaliacaoRepository repository,
        SubmissaoRepository submissaoRepository,
        AvaliadorRepository avaliadorRepository)
    {
        _repository = repository;
        _submissaoRepository = submissaoRepository;
        _avaliadorRepository = avaliadorRepository;
    }

    public async Task<Avaliacao?> FindByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByIdAsync(id, cancellationToken);
    }

    public async Task<List<Avaliacao>> FindAllAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.FindAllAsync(cancellationToken);
    }

    public async Task<List<Avaliacao>> FindByAvaliadorIdAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorIdAsync(avaliadorId, cancellationToken);
    }

    public async Task<Avaliacao> CreateAsync(AvaliacaoRequestDTO request, CancellationToken cancellationToken = default)
    {
        var submissaoExists = await _submissaoRepository.ExistsAsync(request.SubmissaoId, cancellationToken);
        if (!submissaoExists)
        {
            throw new ArgumentException($"Submissão {request.SubmissaoId} não existe.");
        }

        var avaliadorExists = await _avaliadorRepository.ExistsAsync(request.AvaliadorId, cancellationToken);
        if (!avaliadorExists)
        {
            throw new ArgumentException($"Avaliador {request.AvaliadorId} não existe.");
        }

        var avaliacao = new Avaliacao
        {
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            NotaGeral = request.NotaGeral,
            NotaOriginalidade = request.NotaOriginalidade,
            NotaMetodologia = request.NotaMetodologia,
            NotaRelevancia = request.NotaRelevancia,
            NotaRedacao = request.NotaRedacao,
            Recomendacao = request.Recomendacao,
            Confidencial = request.Confidencial,
            AvaliadorId = request.AvaliadorId,
            SubmissaoId = request.SubmissaoId
        };

        return await _repository.CreateAsync(avaliacao, cancellationToken);
    }
}