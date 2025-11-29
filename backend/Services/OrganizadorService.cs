using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Services;
using AcadEvents.Services.EmailTemplates;
namespace AcadEvents.Services;

public class OrganizadorService
{
    private readonly OrganizadorRepository _organizadorRepository;
    private readonly PerfilORCIDRepository _perfilORCIDRepository;
    private readonly HashService _hashService;
    private readonly IEmailService _emailService;

    public OrganizadorService(
        OrganizadorRepository organizadorRepository,
        PerfilORCIDRepository perfilORCIDRepository,
        HashService hashService,
        IEmailService emailService)
    {
        _organizadorRepository = organizadorRepository;
        _perfilORCIDRepository = perfilORCIDRepository;
        _hashService = hashService;
        _emailService = emailService;
    }

    public async Task<List<Organizador>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _organizadorRepository.FindAllAsync(cancellationToken);
    }

    public async Task<Organizador?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _organizadorRepository.FindByIdAsync(id, cancellationToken);
    }

    public async Task<Organizador?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _organizadorRepository.FindByEmailAsync(email, cancellationToken);
    }

    public async Task<Organizador> CreateAsync(OrganizadorRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se o PerfilORCID existe (se fornecido)
        if (request.PerfilORCIDId.HasValue)
        {
            var perfil = await _perfilORCIDRepository.FindByIdAsync(request.PerfilORCIDId.Value, cancellationToken);
            if (perfil == null)
                throw new ArgumentException($"Perfil ORCID com Id {request.PerfilORCIDId.Value} não encontrado.");
        }

        var organizador = new Organizador
        {
            Nome = request.Nome,
            Email = request.Email,
            Senha = _hashService.HashPassword(request.Senha),
            Instituicao = request.Instituicao,
            Pais = request.Pais,
            DataCadastro = DateTime.UtcNow,
            Ativo = true,
            Cargo = request.Cargo,
            Permissoes = request.Permissoes ?? new List<string>(),
            PerfilORCIDId = request.PerfilORCIDId
        };

        var organizadorCriado = await _organizadorRepository.CreateAsync(organizador, cancellationToken);

        // Enviar email de boas-vindas
        try
        {
            var emailBody = EmailTemplateService.RegistroUsuarioTemplate(organizadorCriado.Nome, "Organizador");
            await _emailService.SendEmailAsync(
                organizadorCriado.Email,
                "Bem-vindo ao AcadEvents!",
                emailBody,
                isHtml: true,
                cancellationToken);
        }
        catch
        {
            // Erro no envio de email não deve quebrar o fluxo principal
        }

        return organizadorCriado;
    }

    public async Task<Organizador?> UpdateAsync(long id, OrganizadorRequestDTO request, CancellationToken cancellationToken = default)
    {
        var organizador = await _organizadorRepository.FindByIdAsync(id, cancellationToken);
        if (organizador == null)
            return null;

        // Verificar se o PerfilORCID existe (se fornecido)
        if (request.PerfilORCIDId.HasValue)
        {
            var perfil = await _perfilORCIDRepository.FindByIdAsync(request.PerfilORCIDId.Value, cancellationToken);
            if (perfil == null)
                throw new ArgumentException($"Perfil ORCID com Id {request.PerfilORCIDId.Value} não encontrado.");
        }

        organizador.Nome = request.Nome;
        organizador.Email = request.Email;
        organizador.Senha = request.Senha;
        organizador.Instituicao = request.Instituicao;
        organizador.Pais = request.Pais;
        organizador.Cargo = request.Cargo;
        organizador.Permissoes = request.Permissoes ?? new List<string>();
        organizador.PerfilORCIDId = request.PerfilORCIDId;

        return await _organizadorRepository.UpdateAsync(organizador, cancellationToken);
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _organizadorRepository.DeleteAsync(id, cancellationToken);
    }
}

