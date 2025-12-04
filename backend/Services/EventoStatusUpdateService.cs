using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using AcadEvents.Repositories;

namespace AcadEvents.Services;

/// <summary>
/// Serviço em background que atualiza o status dos eventos periodicamente
/// baseado no prazo de submissão.
/// </summary>
public class EventoStatusUpdateService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EventoStatusUpdateService> _logger;
    private readonly TimeSpan _checkInterval;

    public EventoStatusUpdateService(
        IServiceProvider serviceProvider,
        ILogger<EventoStatusUpdateService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        
        // Ler intervalo do appsettings (padrão: 1 hora)
        var intervalHours = configuration.GetValue<int>("EventoStatusUpdate:CheckIntervalHours", 1);
        _checkInterval = TimeSpan.FromHours(intervalHours);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "EventoStatusUpdateService iniciado. Verificando status dos eventos a cada {Interval} horas",
            _checkInterval.TotalHours);

        // Aguardar um pouco antes da primeira execução para dar tempo da aplicação inicializar
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await AtualizarStatusEventosAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar status dos eventos no scheduler");
            }

            // Aguardar o intervalo configurado antes da próxima verificação
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("EventoStatusUpdateService finalizado");
    }

    private async Task AtualizarStatusEventosAsync(CancellationToken cancellationToken)
    {
        // Criar um escopo para obter serviços com escopo (DbContext, Repositories)
        using var scope = _serviceProvider.CreateScope();
        var eventoRepository = scope.ServiceProvider.GetRequiredService<EventoRepository>();

        try
        {
            var agora = DateTime.UtcNow;
            var eventos = await eventoRepository.FindAllWithOrganizadoresAsync(cancellationToken);
            
            var eventosAtualizados = 0;
            var eventosFechados = 0;
            var eventosReabertos = 0;

            foreach (var evento in eventos)
            {
                if (evento.Configuracao == null)
                    continue;

                var prazoSubmissao = evento.Configuracao.PrazoSubmissao;
                var novoStatus = agora > prazoSubmissao ? "SubmissoesEncerradas" : "SubmissoesAbertas";

                // Só atualizar se o status mudou
                if (evento.StatusEvento != novoStatus)
                {
                    var statusAnterior = evento.StatusEvento;
                    evento.StatusEvento = novoStatus;
                    await eventoRepository.UpdateAsync(evento, cancellationToken);
                    eventosAtualizados++;

                    if (novoStatus == "SubmissoesEncerradas")
                    {
                        eventosFechados++;
                        _logger.LogInformation(
                            "Evento {EventoId} ({Nome}) - Status atualizado de {StatusAntigo} para {StatusNovo}. Prazo de submissão: {PrazoSubmissao}",
                            evento.Id, evento.Nome, statusAnterior, novoStatus, prazoSubmissao);
                    }
                    else
                    {
                        eventosReabertos++;
                        _logger.LogInformation(
                            "Evento {EventoId} ({Nome}) - Status atualizado de {StatusAntigo} para {StatusNovo}. Prazo de submissão: {PrazoSubmissao}",
                            evento.Id, evento.Nome, statusAnterior, novoStatus, prazoSubmissao);
                    }
                }
            }

            if (eventosAtualizados > 0)
            {
                _logger.LogInformation(
                    "Atualização de status concluída. Total: {Total}, Fechados: {Fechados}, Reabertos: {Reabertos}",
                    eventosAtualizados, eventosFechados, eventosReabertos);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar status dos eventos no scheduler");
            throw;
        }
    }
}

