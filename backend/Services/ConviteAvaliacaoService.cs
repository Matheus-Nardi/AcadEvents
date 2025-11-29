using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Dtos;

namespace AcadEvents.Services;

public class ConviteAvaliacaoService
{
    private readonly ConviteAvaliacaoRepository _repository;
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly EventoRepository _eventoRepository;
    private readonly OrganizadorRepository _organizadorRepository;
    private readonly ComiteCientificoRepository _comiteCientificoRepository;
    private readonly AvaliadorRepository _avaliadorRepository;

    public ConviteAvaliacaoService(
        ConviteAvaliacaoRepository repository,
        SubmissaoRepository submissaoRepository,
        EventoRepository eventoRepository,
        OrganizadorRepository organizadorRepository,
        ComiteCientificoRepository comiteCientificoRepository,
        AvaliadorRepository avaliadorRepository)
    {
        _repository = repository;
        _submissaoRepository = submissaoRepository;
        _eventoRepository = eventoRepository;
        _organizadorRepository = organizadorRepository;
        _comiteCientificoRepository = comiteCientificoRepository;
        _avaliadorRepository = avaliadorRepository;
    }

    public async Task<ConviteAvaliacao?> FindByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByIdWithRelacionamentosAsync(id, cancellationToken);
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
            throw new ArgumentException($"Submissão {request.SubmissaoId} não existe.");
        }

        if (submissao.Evento == null)
        {
            throw new ArgumentException($"A submissão {request.SubmissaoId} não está associada a um evento.");
        }

        var eventoId = submissao.EventoId;

        // Verificar se o organizador existe e é organizador do evento
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        if (evento == null)
        {
            throw new ArgumentException($"Evento {eventoId} não encontrado.");
        }

        var organizador = await _organizadorRepository.FindByIdAsync(organizadorId, cancellationToken);
        if (organizador == null)
        {
            throw new ArgumentException($"Organizador {organizadorId} não existe.");
        }

        if (!evento.Organizadores.Contains(organizador))
        {
            throw new ArgumentException($"O organizador {organizadorId} não é organizador do evento {eventoId} relacionado à submissão.");
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
                    throw new ArgumentException($"Avaliador {avaliadorId} não existe.");
                }

                if (!avaliadoresIdsDoComite.Contains(avaliadorId))
                {
                    throw new ArgumentException($"O avaliador {avaliadorId} não faz parte do comitê científico do evento {eventoId}.");
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
                throw new ArgumentException($"Não existem avaliadores no comitê científico do evento {eventoId}.");
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
                throw new ArgumentException($"Todos os avaliadores do comitê científico já receberam convite para esta submissão.");
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

    public async Task<ConviteAvaliacao?> AceitarConviteAsync(long conviteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _repository.AceitarConviteAsync(conviteId, avaliadorId, cancellationToken);
    }

    public async Task<ConviteAvaliacao?> RecusarConviteAsync(long conviteId, long avaliadorId, string motivoRecusa, CancellationToken cancellationToken = default)
    {
        return await _repository.RecusarConviteAsync(conviteId, avaliadorId, motivoRecusa, cancellationToken);
    }

    public async Task<List<ConviteAvaliacao>> FindByAvaliadorComFiltroAsync(long avaliadorId, StatusConvite status, CancellationToken cancellationToken = default)
    {
        return await _repository.FindByAvaliadorComFiltroAsync(avaliadorId, status, cancellationToken);
    }
}

