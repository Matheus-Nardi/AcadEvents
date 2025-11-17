using AcadEvents.Repositories;
using AcadEvents.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddControllers();

// Configuração do DbContext
builder.Services.AddDbContext<AcadEventsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Injeção de dependência dos repositórios
builder.Services.AddScoped<AutorRepository>();
builder.Services.AddScoped<AvaliadorRepository>();
builder.Services.AddScoped<EventoRepository>();
builder.Services.AddScoped<SubmissaoRepository>();
builder.Services.AddScoped<AvaliacaoRepository>();
builder.Services.AddScoped<UsuarioRepository>();
builder.Services.AddScoped<TrilhaRepository>();
builder.Services.AddScoped<TrilhaTematicaRepository>();
builder.Services.AddScoped<ComiteCientificoRepository>();
builder.Services.AddScoped<ConfiguracaoEventoRepository>();
builder.Services.AddScoped<OrganizadorRepository>();
builder.Services.AddScoped<ArquivoSubmissaoRepository>();
builder.Services.AddScoped<ReferenciaRepository>();
builder.Services.AddScoped<SessaoRepository>();
builder.Services.AddScoped<DOIRepository>();
builder.Services.AddScoped<ConviteAvaliacaoRepository>();
builder.Services.AddScoped<HistoricoEventoRepository>();
builder.Services.AddScoped<NotificacaoRepository>();
builder.Services.AddScoped<PerfilORCIDRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();
app.Run();
