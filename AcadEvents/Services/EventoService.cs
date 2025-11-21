using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;

namespace AcadEvents.Services;

public class EventoService
{
    private readonly EventoRepository _eventoRepository;
    private readonly OrganizadorRepository _organizadorRepository;
    private readonly ConfiguracaoEventoRepository _configuracaoEventoRepository;

    public EventoService(
        EventoRepository eventoRepository,
        OrganizadorRepository organizadorRepository,
        ConfiguracaoEventoRepository configuracaoEventoRepository)
    {
        _eventoRepository = eventoRepository;
        _organizadorRepository = organizadorRepository;
        _configuracaoEventoRepository = configuracaoEventoRepository;
    }

    public async Task<List<Evento>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _eventoRepository.FindAllWithOrganizadoresAsync(cancellationToken);
    }

    public async Task<List<Evento>> GetByOrganizadorIdAsync(long organizadorId, CancellationToken cancellationToken = default)
    {
        // Verificar se o organizador existe
        var organizador = await _organizadorRepository.FindByIdAsync(organizadorId, cancellationToken);
        if (organizador == null)
            throw new ArgumentException($"Organizador com Id {organizadorId} não encontrado.");

        return await _eventoRepository.FindByOrganizadorIdAsync(organizadorId, cancellationToken);
    }

    public async Task<Evento?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _eventoRepository.FindByIdWithOrganizadoresAsync(id, cancellationToken);
    }

    public async Task<Evento> CreateAsync(long organizadorId, EventoRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se o organizador existe
        var organizador = await _organizadorRepository.FindByIdAsync(organizadorId, cancellationToken);
        if (organizador == null)
            throw new ArgumentException($"Organizador com Id {organizadorId} não encontrado.");

        // Verificar se a configuração existe
        var configuracao = await _configuracaoEventoRepository.FindByIdAsync(request.ConfiguracaoEventoId, cancellationToken);
        if (configuracao == null)
            throw new ArgumentException($"Configuração de Evento com Id {request.ConfiguracaoEventoId} não encontrada.");

        // Verificar se a configuração já está associada a outro evento (relacionamento 1:1)
        var eventoExistente = await _eventoRepository.FindByConfiguracaoEventoIdAsync(request.ConfiguracaoEventoId, cancellationToken);
        if (eventoExistente != null)
            throw new ArgumentException($"A configuração de evento com Id {request.ConfiguracaoEventoId} já está associada ao evento com Id {eventoExistente.Id}.");

        // Criar o evento
        var evento = new Evento
        {
            Nome = request.Nome,
            Descricao = request.Descricao,
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            Local = request.Local,
            Site = request.Site,
            Logo = request.Logo,
            StatusEvento = request.StatusEvento,
            ConfiguracaoEventoId = request.ConfiguracaoEventoId,
            Organizadores = new List<Organizador> { organizador }
        };

        var eventoCriado = await _eventoRepository.CreateAsync(evento, cancellationToken);
        // Recarregar com organizadores para garantir que estão incluídos
        var eventoCompleto = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoCriado.Id, cancellationToken);
        return eventoCompleto!;
    }

    public async Task<Evento?> UpdateAsync(long id, EventoRequestDTO request, CancellationToken cancellationToken = default)
    {
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(id, cancellationToken);
        if (evento == null)
            return null;

        // Verificar se a configuração existe
        var configuracao = await _configuracaoEventoRepository.FindByIdAsync(request.ConfiguracaoEventoId, cancellationToken);
        if (configuracao == null)
            throw new ArgumentException($"Configuração de Evento com Id {request.ConfiguracaoEventoId} não encontrada.");

        // Verificar se a configuração já está associada a outro evento diferente (relacionamento 1:1)
        if (evento.ConfiguracaoEventoId != request.ConfiguracaoEventoId)
        {
            var eventoComConfiguracao = await _eventoRepository.FindByConfiguracaoEventoIdAsync(request.ConfiguracaoEventoId, cancellationToken);
            if (eventoComConfiguracao != null && eventoComConfiguracao.Id != id)
                throw new ArgumentException($"A configuração de evento com Id {request.ConfiguracaoEventoId} já está associada ao evento com Id {eventoComConfiguracao.Id}.");
        }

        // Atualizar propriedades
        evento.Nome = request.Nome;
        evento.Descricao = request.Descricao;
        evento.DataInicio = request.DataInicio;
        evento.DataFim = request.DataFim;
        evento.Local = request.Local;
        evento.Site = request.Site;
        evento.Logo = request.Logo;
        evento.StatusEvento = request.StatusEvento;
        evento.ConfiguracaoEventoId = request.ConfiguracaoEventoId;

        var eventoAtualizado = await _eventoRepository.UpdateAsync(evento, cancellationToken);
        // Recarregar com organizadores para garantir que estão incluídos
        var eventoCompleto = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoAtualizado.Id, cancellationToken);
        return eventoCompleto;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _eventoRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<Evento> AddOrganizadorAsync(long eventoId, long organizadorId, CancellationToken cancellationToken = default)
    {
        await _eventoRepository.AddOrganizadorAsync(eventoId, organizadorId, cancellationToken);
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        return evento!;
    }

    public async Task<Evento> RemoveOrganizadorAsync(long eventoId, long organizadorId, CancellationToken cancellationToken = default)
    {
        await _eventoRepository.RemoveOrganizadorAsync(eventoId, organizadorId, cancellationToken);
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        return evento!;
    }
}

