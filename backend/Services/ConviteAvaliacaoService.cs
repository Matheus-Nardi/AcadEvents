using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Dtos;
using AcadEvents.Exceptions;
using AcadEvents.Services.EmailTemplates;

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
    private readonly IEmailService _emailService;

    public ConviteAvaliacaoService(
        ConviteAvaliacaoRepository repository,
        SubmissaoRepository submissaoRepository,
        EventoRepository eventoRepository,
        OrganizadorRepository organizadorRepository,
        ComiteCientificoRepository comiteCientificoRepository,
        AvaliadorRepository avaliadorRepository,
        AvaliacaoRepository avaliacaoRepository,
        IEmailService emailService)
    {
        _repository = repository;
        _submissaoRepository = submissaoRepository;
        _eventoRepository = eventoRepository;
        _organizadorRepository = organizadorRepository;
        _comiteCientificoRepository = comiteCientificoRepository;
        _avaliadorRepository = avaliadorRepository;
        _avaliacaoRepository = avaliacaoRepository;
        _emailService = emailService;
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
        
        // Recusar o convite
        var conviteRecusado = await _repository.RecusarConviteAsync(conviteId, avaliadorId, motivoRecusa, cancellationToken);
        if (conviteRecusado == null)
            throw new BadRequestException("Erro ao recusar convite.");
        
        // Notificar organizadores sobre a recusa
        try
        {
            await NotificarOrganizadoresSobreRecusaAsync(conviteRecusado, motivoRecusa, cancellationToken);
        }
        catch
        {
            // Erro no envio de email não deve quebrar o fluxo principal
            // O convite já foi recusado com sucesso
        }
        
        return conviteRecusado;
    }

    private async Task NotificarOrganizadoresSobreRecusaAsync(
        ConviteAvaliacao convite, 
        string motivoRecusa,
        CancellationToken cancellationToken = default)
    {
        // Buscar submissão com evento e organizadores
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(convite.SubmissaoId, cancellationToken);
        if (submissao?.Evento?.Organizadores == null)
            return; // Não há organizadores para notificar

        // Buscar avaliador
        var avaliador = await _avaliadorRepository.FindByIdAsync(convite.AvaliadorId, cancellationToken);
        if (avaliador == null)
            return; // Não encontrou o avaliador

        // Calcular avaliações faltantes
        var numeroRequerido = submissao.Evento.Configuracao?.NumeroAvaliadoresPorSubmissao ?? 0;
        var convitesAceitos = await _repository.CountConvitesAceitosPorSubmissaoAsync(convite.SubmissaoId, cancellationToken);
        var avaliacoesCompletas = await _avaliacaoRepository.CountAvaliacoesCompletasPorSubmissaoAsync(convite.SubmissaoId, cancellationToken);
        var quantidadeFaltante = numeroRequerido - convitesAceitos;

        // Enviar email para cada organizador do evento
        foreach (var organizador in submissao.Evento.Organizadores)
        {
            try
            {
                var emailBody = EmailTemplateService.ConviteRecusadoTemplate(
                    organizador.Nome,
                    avaliador.Nome,
                    submissao.Titulo,
                    motivoRecusa,
                    quantidadeFaltante,
                    numeroRequerido);
                
                await _emailService.SendEmailAsync(
                    organizador.Email,
                    $"🔔 Convite Recusado - Submissão: {submissao.Titulo}",
                    emailBody,
                    isHtml: true,
                    cancellationToken);
            }
            catch
            {
                // Log error, mas não quebra o fluxo
                // Continua tentando enviar para os outros organizadores
            }
        }
    }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorComFiltroAsync(long avaliadorId, StatusConvite status, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorComFiltroAsync(avaliadorId, status, cancellationToken);
    }
}

