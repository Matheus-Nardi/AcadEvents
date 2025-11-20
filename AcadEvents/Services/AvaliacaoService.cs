using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Dtos;

namespace AcadEvents.Services;

public class AvaliacaoService
{
    private readonly AvaliacaoRepository _repository;
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly AvaliadorRepository _avaliadorRepository;
    private readonly ConviteAvaliacaoRepository _conviteAvaliacaoRepository;
    private readonly ComiteCientificoRepository _comiteCientificoRepository;

    public AvaliacaoService(
        AvaliacaoRepository repository,
        SubmissaoRepository submissaoRepository,
        AvaliadorRepository avaliadorRepository,
        ConviteAvaliacaoRepository conviteAvaliacaoRepository,
        ComiteCientificoRepository comiteCientificoRepository)
    {
        _repository = repository;
        _submissaoRepository = submissaoRepository;
        _avaliadorRepository = avaliadorRepository;
        _conviteAvaliacaoRepository = conviteAvaliacaoRepository;
        _comiteCientificoRepository = comiteCientificoRepository;
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
        // Verificar se a submissão existe e obter o evento relacionado
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(request.SubmissaoId, cancellationToken);
        if (submissao == null)
        {
            throw new ArgumentException($"Submissão {request.SubmissaoId} não existe.");
        }

        var avaliadorExists = await _avaliadorRepository.ExistsAsync(request.AvaliadorId, cancellationToken);
        if (!avaliadorExists)
        {
            throw new ArgumentException($"Avaliador {request.AvaliadorId} não existe.");
        }

        // Verificar se o avaliador aceitou o convite de avaliação para esta submissão
        var conviteAceito = await _conviteAvaliacaoRepository.ExisteConviteAceitoAsync(
            request.AvaliadorId, 
            request.SubmissaoId, 
            cancellationToken);
        
        if (!conviteAceito)
        {
            throw new ArgumentException($"O avaliador {request.AvaliadorId} não aceitou o convite de avaliação para a submissão {request.SubmissaoId}.");
        }

        // Obter o evento através da trilha temática -> trilha -> evento
        var eventoId = submissao.TrilhaTematica.Trilha.EventoId;

        // Verificar se o avaliador faz parte do comitê científico do evento
        var fazParteDoComite = await _comiteCientificoRepository.AvaliadorFazParteDoComiteDoEventoAsync(
            request.AvaliadorId, 
            eventoId, 
            cancellationToken);

        if (!fazParteDoComite)
        {
            throw new ArgumentException($"O avaliador {request.AvaliadorId} não faz parte do comitê científico do evento relacionado à submissão.");
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