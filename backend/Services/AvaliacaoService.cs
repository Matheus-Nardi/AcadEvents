using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Dtos;
using AcadEvents.Exceptions;

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

    public async Task<Avaliacao> FindByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var avaliacao = await _repository.FindByIdAsync(id, cancellationToken);
        if (avaliacao == null)
            throw new NotFoundException("Avaliação", id);
        return avaliacao;
    }

    public async Task<List<Avaliacao>> FindAllAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.FindAllAsync(cancellationToken);
    }

    public async Task<List<Avaliacao>> FindByAvaliadorIdAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorIdAsync(avaliadorId, cancellationToken);
    }

    public async Task<List<Avaliacao>> FindBySubmissaoIdAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindBySubmissaoIdAsync(submissaoId, cancellationToken);
    }

    public async Task<Avaliacao?> FindByAvaliadorIdAndSubmissaoIdAsync(long avaliadorId, long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorIdAndSubmissaoIdAsync(avaliadorId, submissaoId, cancellationToken);
    }

    public async Task<Avaliacao> CreateAsync(AvaliacaoRequestDTO request, long avaliadorId, CancellationToken cancellationToken = default)
    {
        // Verificar se a submissão existe e obter o evento relacionado
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(request.SubmissaoId, cancellationToken);
        if (submissao == null)
        {
            throw new NotFoundException("Submissão", request.SubmissaoId);
        }

        var avaliadorExists = await _avaliadorRepository.ExistsAsync(avaliadorId, cancellationToken);
        if (!avaliadorExists)
        {
            throw new NotFoundException("Avaliador", avaliadorId);
        }

        // Verificar se o avaliador aceitou o convite de avaliação para esta submissão
        var conviteAceito = await _conviteAvaliacaoRepository.ExisteConviteAceitoAsync(
            avaliadorId, 
            request.SubmissaoId, 
            cancellationToken);
        
        if (!conviteAceito)
        {
            throw new BusinessRuleException($"O avaliador {avaliadorId} não aceitou o convite de avaliação para a submissão {request.SubmissaoId}.");
        }

        // Verificar se a submissão está associada a um evento
        if (submissao.Evento == null)
        {
            throw new BadRequestException($"A submissão {request.SubmissaoId} não está associada a um evento.");
        }

        var eventoId = submissao.EventoId;

        // Verificar se o avaliador faz parte do comitê científico do evento
        var fazParteDoComite = await _comiteCientificoRepository.AvaliadorFazParteDoComiteDoEventoAsync(
            avaliadorId, 
            eventoId, 
            cancellationToken);

        if (!fazParteDoComite)
        {
            throw new ForbiddenException($"O avaliador {avaliadorId} não faz parte do comitê científico do evento relacionado à submissão.");
        }

        // Validar se já existe uma avaliação deste avaliador para esta submissão
        var avaliacaoExistente = await _repository.FindByAvaliadorIdAndSubmissaoIdAsync(avaliadorId, request.SubmissaoId, cancellationToken);
        if (avaliacaoExistente != null)
        {
            throw new BusinessRuleException($"O avaliador {avaliadorId} já possui uma avaliação para a submissão {request.SubmissaoId}.");
        }

        // Validar se o número máximo de avaliações já foi atingido
        if (submissao.Evento.Configuracao == null)
        {
            throw new BadRequestException("Configuração do evento não encontrada.");
        }

        var numeroAvaliacoes = await _repository.CountAvaliacoesCompletasPorSubmissaoAsync(request.SubmissaoId, cancellationToken);
        var numeroRequerido = submissao.Evento.Configuracao.NumeroAvaliadoresPorSubmissao;

        if (numeroAvaliacoes >= numeroRequerido)
        {
            throw new BusinessRuleException($"Número máximo de avaliações já atingido para esta submissão. Requerido: {numeroRequerido}, Atual: {numeroAvaliacoes}.");
        }

        var avaliacao = new Avaliacao
        {
            DataCriacao = DateTime.Now,
            NotaGeral = request.NotaGeral,
            NotaOriginalidade = request.NotaOriginalidade,
            NotaMetodologia = request.NotaMetodologia,
            NotaRelevancia = request.NotaRelevancia,
            NotaRedacao = request.NotaRedacao,
            RecomendacaoEnum = request.RecomendacaoEnum,
            Recomendacao = request.Recomendacao,
            Confidencial = request.Confidencial,
            AvaliadorId = avaliadorId,
            SubmissaoId = request.SubmissaoId
        };

        var avaliacaoCriada = await _repository.CreateAsync(avaliacao, cancellationToken);

        // Calcular e atualizar status automaticamente após criar avaliação
        await CalcularEAtualizarStatusSubmissaoAsync(request.SubmissaoId, cancellationToken);

        return avaliacaoCriada;
    }

    private async Task CalcularEAtualizarStatusSubmissaoAsync(
        long submissaoId, 
        CancellationToken cancellationToken = default)
    {
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(submissaoId, cancellationToken);
        if (submissao == null) return;

        var avaliacoes = await _repository.FindBySubmissaoIdAsync(submissaoId, cancellationToken);
        
        if (avaliacoes == null || !avaliacoes.Any()) return;

        // Verificar se todas as avaliações foram concluídas
        if (submissao.Evento?.Configuracao == null) return;

        var numeroRequerido = submissao.Evento.Configuracao.NumeroAvaliadoresPorSubmissao;
        if (avaliacoes.Count < numeroRequerido) return;

        // Contar recomendações
        var aprovar = avaliacoes.Count(a => a.RecomendacaoEnum == RecomendacaoAvaliacao.APROVAR);
        var rejeitar = avaliacoes.Count(a => a.RecomendacaoEnum == RecomendacaoAvaliacao.REJEITAR);
        var aprovarComRessalvas = avaliacoes.Count(a => a.RecomendacaoEnum == RecomendacaoAvaliacao.APROVAR_COM_RESSALVAS);

        // Calcular média das notas gerais
        var mediaNotaGeral = avaliacoes.Average(a => a.NotaGeral);

        StatusSubmissao novoStatus;

        // Caso 1: 50/50 (empate) -> EM_REVISÃO
        if (aprovar == rejeitar && aprovarComRessalvas == 0)
        {
            novoStatus = StatusSubmissao.EM_REVISÃO;
        }
        // Caso 2: Maioria aprova -> APROVADA
        else if (aprovar > rejeitar && aprovar > aprovarComRessalvas)
        {
            // Verificar se deve ser APROVADA_COM_RESSALVAS baseado na nota
            if (mediaNotaGeral >= 6.0 && mediaNotaGeral < 8.0 && aprovarComRessalvas > 0)
            {
                novoStatus = StatusSubmissao.APROVADA_COM_RESSALVAS;
            }
            else
            {
                novoStatus = StatusSubmissao.APROVADA;
            }
        }
        // Caso 3: Maioria rejeita -> REJEITADA
        else if (rejeitar > aprovar && rejeitar > aprovarComRessalvas)
        {
            novoStatus = StatusSubmissao.REJEITADA;
        }
        // Caso 4: Maioria aprova com ressalvas ou nota entre 6-8
        else if (aprovarComRessalvas > aprovar && aprovarComRessalvas > rejeitar)
        {
            novoStatus = StatusSubmissao.APROVADA_COM_RESSALVAS;
        }
        // Caso 5: Nota média entre 6-8 e há aprovações -> APROVADA_COM_RESSALVAS
        else if (mediaNotaGeral >= 6.0 && mediaNotaGeral < 8.0 && aprovar > 0)
        {
            novoStatus = StatusSubmissao.APROVADA_COM_RESSALVAS;
        }
        // Caso padrão: se houver mais aprovações que rejeições
        else if (aprovar > rejeitar)
        {
            novoStatus = StatusSubmissao.APROVADA;
        }
        else
        {
            novoStatus = StatusSubmissao.REJEITADA;
        }

        // Atualizar status da submissão
        submissao.Status = novoStatus;
        await _submissaoRepository.UpdateAsync(submissao, cancellationToken);
    }
}