using AcadEvents.Repositories;
using AcadEvents.Services;

namespace AcadEvents.Extensions;

public static class InjectExt
{
    public static void Inject(this IServiceCollection service)
    {
        service.AddScoped<AutorRepository>();
        service.AddScoped<AvaliadorRepository>();
        service.AddScoped<EventoRepository>();
        service.AddScoped<SubmissaoRepository>();
        service.AddScoped<AvaliacaoRepository>();
        service.AddScoped<UsuarioRepository>();
        service.AddScoped<TrilhaRepository>();
        service.AddScoped<TrilhaTematicaRepository>();
        service.AddScoped<ComiteCientificoRepository>();
        service.AddScoped<ConfiguracaoEventoRepository>();
        service.AddScoped<OrganizadorRepository>();
        service.AddScoped<ArquivoSubmissaoRepository>();
        service.AddScoped<ReferenciaRepository>();
        service.AddScoped<SessaoRepository>();
        service.AddScoped<DOIRepository>();
        service.AddScoped<ConviteAvaliacaoRepository>();
        service.AddScoped<HistoricoEventoRepository>();
        service.AddScoped<NotificacaoRepository>();
        service.AddScoped<PerfilORCIDRepository>();

        // Services
        service.AddScoped<EventoService>();
    }
}