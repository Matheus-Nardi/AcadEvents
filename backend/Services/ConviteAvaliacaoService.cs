using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Dtos;
using AcadEvents.Exceptions;

namespace AcadEvents.Services;

public class ConviteAvaliacaoService
{
    private readonly ConviteAvaliacaoRepository _repository;
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly EventoRepository _eventoRepository;
    private readonly OrganizadorRepository _organizadorRepository;
    private readonly ComiteCientificoRepository _comiteCientificoRepository;
    private readonly AvaliadorRepository _avaliadorRepository;
    private readonly AvaliacaoRepository _avaliacaoRepository;

    public ConviteAvaliacaoService(
        ConviteAvaliacaoRepository repository,
        SubmissaoRepository submissaoRepository,
        EventoRepository eventoRepository,
        OrganizadorRepository organizadorRepository,
        ComiteCientificoRepository comiteCientificoRepository,
        AvaliadorRepository avaliadorRepository,
        AvaliacaoRepository avaliacaoRepository)
    {
        _repository = repository;
        _submissaoRepository = submissaoRepository;
        _eventoRepository = eventoRepository;
        _organizadorRepository = organizadorRepository;
        _comiteCientificoRepository = comiteCientificoRepository;
        _avaliadorRepository = avaliadorRepository;
        _avaliacaoRepository = avaliacaoRepository;
    }

    public async Task<ConviteAvaliacao> FindByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var convite = await _repository.FindByIdWithRelacionamentosAsync(id, cancellationToken);
        if (convite == null)
            throw new NotFoundException("Convite de Avaliação", id);
        return convite;
    }

    public async Task<List<ConviteAvaliacao>> FindAllAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.FindAllAsync(cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorIdAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorIdAsync(avaliadorId, cancellationToken);
    }
    
    public async Task<List<ConviteAvaliacao>> FindByAvaliadorIdWhereResponseIsNullAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorWhereResponseIsNullAsync(avaliadorId, cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> FindBySubmissaoIdAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _repository.FindBySubmissaoIdAsync(submissaoId, cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> CreateAsync(long organizadorId, ConviteAvaliacaoRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se a submissão existe e obter o evento relacionado
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(request.SubmissaoId, cancellationToken);
        if (submissao == null)
        {
            throw new NotFoundException("Submissão", request.SubmissaoId);
        }

        if (submissao.Evento == null)
        {
            throw new BadRequestException($"A submissão {request.SubmissaoId} não está associada a um evento.");
        }

        var eventoId = submissao.EventoId;

        // Verificar se o organizador existe e é organizador do evento
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        if (evento == null)
        {
            throw new NotFoundException("Evento", eventoId);
        }

        var organizador = await _organizadorRepository.FindByIdAsync(organizadorId, cancellationToken);
        if (organizador == null)
        {
            throw new NotFoundException("Organizador", organizadorId);
        }

        if (!evento.Organizadores.Contains(organizador))
        {
            throw new ForbiddenException($"O organizador {organizadorId} não é organizador do evento {eventoId} relacionado à submissão.");
        }

        // Obter os avaliadores do comitê científico do evento
        List<Avaliador> avaliadoresParaConvidar;

        if (request.AvaliadoresIds != null && request.AvaliadoresIds.Any())
        {
            // Validar se os avaliadores fornecidos fazem parte do comitê do evento
            avaliadoresParaConvidar = new List<Avaliador>();
            var avaliadoresDoComite = await _comiteCientificoRepository.FindAvaliadoresDoComiteDoEventoAsync(eventoId, cancellationToken);
            var avaliadoresIdsDoComite = avaliadoresDoComite.Select(a => a.Id).ToHashSet();

            foreach (var avaliadorId in request.AvaliadoresIds)
            {
                var avaliador = await _avaliadorRepository.FindByIdAsync(avaliadorId, cancellationToken);
                if (avaliador == null)
                {
                    throw new NotFoundException("Avaliador", avaliadorId);
                }

                if (!avaliadoresIdsDoComite.Contains(avaliadorId))
                {
                    throw new ForbiddenException($"O avaliador {avaliadorId} não faz parte do comitê científico do evento {eventoId}.");
                }

                // Verificar se já existe um convite para este avaliador e submissão
                var conviteExistente = await _repository.ExisteConviteAsync(avaliadorId, request.SubmissaoId, cancellationToken);
                if (conviteExistente)
                {
                    continue; // Pula se já existe convite
                }

                avaliadoresParaConvidar.Add(avaliador);
            }
        }
        else
        {
            // Buscar todos os avaliadores do comitê científico do evento
            avaliadoresParaConvidar = await _comiteCientificoRepository.FindAvaliadoresDoComiteDoEventoAsync(eventoId, cancellationToken);
            
            if (!avaliadoresParaConvidar.Any())
            {
                throw new BadRequestException($"Não existem avaliadores no comitê científico do evento {eventoId}.");
            }

            // Filtrar apenas aqueles que ainda não receberam convite para esta submissão
            var avaliadoresFiltrados = new List<Avaliador>();
            foreach (var avaliador in avaliadoresParaConvidar)
            {
                var conviteExistente = await _repository.ExisteConviteAsync(avaliador.Id, request.SubmissaoId, cancellationToken);
                if (!conviteExistente)
                {
                    avaliadoresFiltrados.Add(avaliador);
                }
            }
            avaliadoresParaConvidar = avaliadoresFiltrados;

            if (!avaliadoresParaConvidar.Any())
            {
                throw new ConflictException($"Todos os avaliadores do comitê científico já receberam convite para esta submissão.");
            }
        }

        // Criar os convites
        var convites = avaliadoresParaConvidar.Select(avaliador => new ConviteAvaliacao
        {
            DataConvite = DateTime.UtcNow,
            PrazoAvaliacao = request.PrazoAvaliacao,
            AvaliadorId = avaliador.Id,
            SubmissaoId = request.SubmissaoId,
            Aceito = null,
            MotivoRecusa = string.Empty,
            DataResposta = null
        }).ToList();

        var convitesCriados = await _repository.CreateBulkAsync(convites, cancellationToken);

        // Retornar os convites com relacionamentos carregados
        var ids = convitesCriados.Select(c => c.Id).ToList();
        var convitesCompletos = new List<ConviteAvaliacao>();
        foreach (var id in ids)
        {
            var convite = await _repository.FindByIdWithRelacionamentosAsync(id, cancellationToken);
            if (convite != null)
            {
                convitesCompletos.Add(convite);
            }
        }

        return convitesCompletos;
    }

    public async Task<ConviteAvaliacao> AceitarConviteAsync(long conviteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        // Buscar o convite com relacionamentos para obter a submissão
        var convite = await _repository.FindByIdWithRelacionamentosAsync(conviteId, cancellationToken);
        if (convite == null)
            throw new NotFoundException("Convite de Avaliação", conviteId);
        
        if (convite.Aceito.HasValue)
            throw new BadRequestException("Convite já foi respondido.");
        
        if (convite.AvaliadorId != avaliadorId)
            throw new ForbiddenException("Este convite não pertence ao avaliador autenticado.");
        
        // Validar se o número máximo de avaliações já foi atingido
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(convite.SubmissaoId, cancellationToken);
        if (submissao?.Evento?.Configuracao == null)
            throw new BadRequestException("Submissão ou configuração do evento não encontrada.");
        
        var numeroAvaliacoes = await _avaliacaoRepository.CountAvaliacoesCompletasPorSubmissaoAsync(convite.SubmissaoId, cancellationToken);
        var numeroRequerido = submissao.Evento.Configuracao.NumeroAvaliadoresPorSubmissao;
        
        if (numeroAvaliacoes >= numeroRequerido)
        {
            throw new BusinessRuleException($"Número máximo de avaliadores já atingido para esta submissão. Requerido: {numeroRequerido}, Atual: {numeroAvaliacoes}.");
        }
        
        // Aceitar o convite
        var conviteAceito = await _repository.AceitarConviteAsync(conviteId, avaliadorId, cancellationToken);
        if (conviteAceito == null)
            throw new BadRequestException("Erro ao aceitar convite.");
        
        return conviteAceito;
    }

    public async Task<ConviteAvaliacao> RecusarConviteAsync(long conviteId, long avaliadorId, string motivoRecusa, CancellationToken cancellationToken = default)
    {
        // Buscar o convite com relacionamentos para obter a submissão
        var convite = await _repository.FindByIdWithRelacionamentosAsync(conviteId, cancellationToken);
        if (convite == null)
            throw new NotFoundException("Convite de Avaliação", conviteId);
        
        if (convite.Aceito.HasValue)
            throw new BadRequestException("Convite já foi respondido.");
        
        if (convite.AvaliadorId != avaliadorId)
            throw new ForbiddenException("Este convite não pertence ao avaliador autenticado.");
        
        var submissaoId = convite.SubmissaoId;
        
        // Recusar o convite
        var conviteRecusado = await _repository.RecusarConviteAsync(conviteId, avaliadorId, motivoRecusa, cancellationToken);
        if (conviteRecusado == null)
            throw new BadRequestException("Erro ao recusar convite.");
        
        // Tentar repor convite se necessário
        try
        {
            await ReporConviteRecusadoAsync(submissaoId, cancellationToken);
        }
        catch
        {
            // Erro na reposição não deve quebrar o fluxo principal
            // O convite já foi recusado com sucesso
        }
        
        return conviteRecusado;
    }

    private async Task ReporConviteRecusadoAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        // Buscar a submissão com evento e configuração
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(submissaoId, cancellationToken);
        if (submissao?.Evento?.Configuracao == null)
            return; // Não há configuração para validar
        
        var eventoId = submissao.EventoId;
        var numeroRequerido = submissao.Evento.Configuracao.NumeroAvaliadoresPorSubmissao;
        var prazoAvaliacao = submissao.Evento.Configuracao.PrazoAvaliacao;
        
        // Contar convites aceitos ativos (que ainda não resultaram em avaliação completa)
        var convitesAceitos = await _repository.CountConvitesAceitosPorSubmissaoAsync(submissaoId, cancellationToken);
        
        // Calcular quantos convites faltam
        var numeroFaltante = numeroRequerido - convitesAceitos;
        
        if (numeroFaltante <= 0)
            return; // Já tem convites suficientes aceitos
        
        // Contar total de convites já enviados para esta submissão (incluindo recusados)
        var todosConvites = await _repository.FindBySubmissaoIdAsync(submissaoId, cancellationToken);
        var totalTentativas = todosConvites.Count;
        var limiteTentativas = numeroRequerido * 3; // Limite de 3x o número requerido
        
        // Se já tentou muitas vezes, parar de repor automaticamente
        if (totalTentativas >= limiteTentativas)
        {
            // Parar reposição automática - organizador precisará enviar manualmente
            return;
        }
        
        // Buscar avaliadores disponíveis (sem convite para esta submissão)
        var avaliadoresDoComite = await _comiteCientificoRepository.FindAvaliadoresDoComiteDoEventoAsync(eventoId, cancellationToken);
        
        var avaliadoresDisponiveis = new List<Avaliador>();
        foreach (var avaliador in avaliadoresDoComite)
        {
            var conviteExistente = await _repository.ExisteConviteAsync(avaliador.Id, submissaoId, cancellationToken);
            if (!conviteExistente)
            {
                avaliadoresDisponiveis.Add(avaliador);
            }
        }
        
        // Se não há avaliadores disponíveis, não é possível repor
        if (!avaliadoresDisponiveis.Any())
            return;
        
        // Selecionar aleatoriamente o número faltante de avaliadores (ou todos se houver menos)
        var random = new Random();
        var quantidadeParaSelecionar = Math.Min(numeroFaltante, avaliadoresDisponiveis.Count);
        var avaliadoresSelecionados = avaliadoresDisponiveis
            .OrderBy(x => random.Next())
            .Take(quantidadeParaSelecionar)
            .ToList();
        
        // Criar novos convites
        var novosConvites = avaliadoresSelecionados.Select(avaliador => new ConviteAvaliacao
        {
            DataConvite = DateTime.UtcNow,
            PrazoAvaliacao = prazoAvaliacao,
            AvaliadorId = avaliador.Id,
            SubmissaoId = submissaoId,
            Aceito = null,
            MotivoRecusa = string.Empty,
            DataResposta = null
        }).ToList();
        
        if (novosConvites.Any())
        {
            await _repository.CreateBulkAsync(novosConvites, cancellationToken);
        }
    }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorComFiltroAsync(long avaliadorId, StatusConvite status, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorComFiltroAsync(avaliadorId, status, cancellationToken);
    }
}

