using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Exceptions;

namespace AcadEvents.Services;

public class ConfiguracaoEventoService
{
    private readonly ConfiguracaoEventoRepository _configuracaoEventoRepository;
    private readonly EventoRepository _eventoRepository;

    public ConfiguracaoEventoService(
        ConfiguracaoEventoRepository configuracaoEventoRepository,
        EventoRepository eventoRepository)
    {
        _configuracaoEventoRepository = configuracaoEventoRepository;
        _eventoRepository = eventoRepository;
    }

    public async Task<List<ConfiguracaoEvento>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _configuracaoEventoRepository.FindAllAsync(cancellationToken);
    }

    public async Task<ConfiguracaoEvento> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var configuracao = await _configuracaoEventoRepository.FindByIdAsync(id, cancellationToken);
        if (configuracao == null)
            throw new NotFoundException("Configuração de Evento", id);
        return configuracao;
    }

    public async Task<ConfiguracaoEvento> CreateAsync(long eventoId, ConfiguracaoEventoRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se o evento existe
        var evento = await _eventoRepository.FindByIdAsync(eventoId, cancellationToken);
        if (evento == null)
            throw new NotFoundException("Evento", eventoId);

        // Verificar se o evento já tem uma configuração
        if (evento.ConfiguracaoEventoId != 0)
        {
            var configuracaoExistente = await _configuracaoEventoRepository.FindByIdAsync(evento.ConfiguracaoEventoId, cancellationToken);
            if (configuracaoExistente != null)
                throw new ConflictException($"O evento com Id {eventoId} já possui uma configuração associada (Id: {evento.ConfiguracaoEventoId}).");
        }

        // Validar que o prazo de submissão não acontece antes da data de início do evento
        if (request.PrazoSubmissao < evento.DataInicio)
            throw new BusinessRuleException($"O prazo de submissão ({request.PrazoSubmissao:dd/MM/yyyy}) não pode acontecer antes da data de início do evento ({evento.DataInicio:dd/MM/yyyy}).");

        // Validar número mínimo de avaliadores por submissão
        if (request.NumeroAvaliadoresPorSubmissao < 3)
            throw new BusinessRuleException($"O número mínimo de avaliadores por submissão é 3. Valor informado: {request.NumeroAvaliadoresPorSubmissao}.");

        var configuracao = new ConfiguracaoEvento
        {
            PrazoSubmissao = request.PrazoSubmissao,
            PrazoAvaliacao = request.PrazoAvaliacao,
            NumeroAvaliadoresPorSubmissao = request.NumeroAvaliadoresPorSubmissao,
            AvaliacaoDuploCego = true
        };


        // Associar a configuração ao evento
        evento.Configuracao = configuracao;
        await _eventoRepository.UpdateAsync(evento, cancellationToken);

        return configuracao;
    }

    public async Task<ConfiguracaoEvento> CreateAsync(ConfiguracaoEventoRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Validar número mínimo de avaliadores por submissão
        if (request.NumeroAvaliadoresPorSubmissao < 3)
            throw new BusinessRuleException($"O número mínimo de avaliadores por submissão é 3. Valor informado: {request.NumeroAvaliadoresPorSubmissao}.");

        var configuracao = new ConfiguracaoEvento
        {
            PrazoSubmissao = request.PrazoSubmissao,
            PrazoAvaliacao = request.PrazoAvaliacao,
            NumeroAvaliadoresPorSubmissao = request.NumeroAvaliadoresPorSubmissao,
            AvaliacaoDuploCego = true
        };

        return await _configuracaoEventoRepository.CreateAsync(configuracao, cancellationToken);
    }

    public async Task<ConfiguracaoEvento> UpdateAsync(long id, ConfiguracaoEventoRequestDTO request, CancellationToken cancellationToken = default)
    {
        var configuracao = await _configuracaoEventoRepository.FindByIdAsync(id, cancellationToken);
        if (configuracao == null)
            throw new NotFoundException("Configuração de Evento", id);

        // Verificar se a configuração está associada a um evento e validar o prazo de submissão
        var evento = await _eventoRepository.FindByConfiguracaoEventoIdAsync(id, cancellationToken);
        if (evento != null && request.PrazoSubmissao < evento.DataInicio)
            throw new BusinessRuleException($"O prazo de submissão ({request.PrazoSubmissao:dd/MM/yyyy}) não pode acontecer antes da data de início do evento ({evento.DataInicio:dd/MM/yyyy}).");

        // Validar número mínimo de avaliadores por submissão
        if (request.NumeroAvaliadoresPorSubmissao < 3)
            throw new BusinessRuleException($"O número mínimo de avaliadores por submissão é 3. Valor informado: {request.NumeroAvaliadoresPorSubmissao}.");

        configuracao.PrazoSubmissao = request.PrazoSubmissao;
        configuracao.PrazoAvaliacao = request.PrazoAvaliacao;
        configuracao.NumeroAvaliadoresPorSubmissao = request.NumeroAvaliadoresPorSubmissao;
        configuracao.AvaliacaoDuploCego = true;

        return await _configuracaoEventoRepository.UpdateAsync(configuracao, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var configuracao = await _configuracaoEventoRepository.FindByIdAsync(id, cancellationToken);
        if (configuracao == null)
            throw new NotFoundException("Configuração de Evento", id);

        // Remover a associação do evento antes de deletar
        var eventos = await _eventoRepository.FindAllAsync(cancellationToken);
        var eventoComConfiguracao = eventos.FirstOrDefault(e => e.ConfiguracaoEventoId == id);
        if (eventoComConfiguracao != null)
        {
            eventoComConfiguracao.ConfiguracaoEventoId = 0;
            await _eventoRepository.UpdateAsync(eventoComConfiguracao, cancellationToken);
        }

        await _configuracaoEventoRepository.DeleteAsync(id, cancellationToken);
    }
}

