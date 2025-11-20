using AcadEvents.Repositories;
using AcadEvents.Data;
using AcadEvents.Extensions;
using AcadEvents.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddControllers();

// Configuração do HttpClient para API Externa (Crossref)
builder.Services.AddHttpClient<ICrossrefService, CrossrefService>(client =>
{
    client.BaseAddress = new Uri("https://api.crossref.org/");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
    client.DefaultRequestHeaders.Add("User-Agent", "AcadEvents/1.0 (mailto:contato@acadevents.com)");
});

// Configuração do DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AcadEventsDbContext>(options =>
    options.UseSqlServer(
        connectionString,
        sqlServerOptions => sqlServerOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

// Configuração de Autenticação JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Valida a assinatura do token usando a chave secreta
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key não configurada"))),

        // Valida quem emitiu o token
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],

        // Valida para quem o token foi emitido
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],

        // Valida o tempo de expiração
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero // Remove o tempo de tolerância padrão de 5 minutos
    };
});

builder.Services.AddAuthorization();

// Injeção de dependência dos repositórios
builder.Services.Inject();

var app = builder.Build();

// Aplicar migrations automaticamente
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AcadEventsDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Aplicando migrations do banco de dados...");
        dbContext.Database.Migrate();
        logger.LogInformation("Migrations aplicadas com sucesso!");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao aplicar migrations. A aplicação continuará, mas pode haver problemas de conexão.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// Middlewares de autenticação e autorização (devem vir antes de MapControllers)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
