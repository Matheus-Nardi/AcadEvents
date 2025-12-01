using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Services;
using AcadEvents.Services.EmailTemplates;
using AcadEvents.Exceptions;
namespace AcadEvents.Services;

public class AvaliadorService
{
    private readonly AvaliadorRepository _avaliadorRepository;
    private readonly PerfilORCIDRepository _perfilORCIDRepository;
    private readonly HashService _hashService;
    private readonly IEmailService _emailService;
    
    public AvaliadorService(
        AvaliadorRepository avaliadorRepository,
        PerfilORCIDRepository perfilORCIDRepository,
        HashService hashService,
        IEmailService emailService)
    {
        _avaliadorRepository = avaliadorRepository;
        _perfilORCIDRepository = perfilORCIDRepository;
        _hashService = hashService;
        _emailService = emailService;
    }

    public async Task<List<Avaliador>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _avaliadorRepository.FindAllAsync(cancellationToken);
    }

    public async Task<Avaliador> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var avaliador = await _avaliadorRepository.FindByIdAsync(id, cancellationToken);
        if (avaliador == null)
            throw new NotFoundException("Avaliador", id);
        return avaliador;
    }

    public async Task<Avaliador> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var avaliador = await _avaliadorRepository.FindByEmailAsync(email, cancellationToken);
        if (avaliador == null)
            throw new NotFoundException($"Avaliador com email {email} não encontrado.");
        return avaliador;
    }

    public async Task<Avaliador> CreateAsync(AvaliadorRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se o PerfilORCID existe (se fornecido)
        if (request.PerfilORCIDId.HasValue)
        {
            var perfil = await _perfilORCIDRepository.FindByIdAsync(request.PerfilORCIDId.Value, cancellationToken);
            if (perfil == null)
                throw new NotFoundException("Perfil ORCID", request.PerfilORCIDId.Value);
        }

        var avaliador = new Avaliador
        {
            Nome = request.Nome,
            Email = request.Email,
            Senha = _hashService.HashPassword(request.Senha),
            Instituicao = request.Instituicao,
            Pais = request.Pais,
            DataCadastro = DateTime.UtcNow,
            Ativo = true,
            Especialidades = request.Especialidades ?? new List<string>(),
            NumeroAvaliacoes = request.NumeroAvaliacoes,
            Disponibilidade = request.Disponibilidade,
            PerfilORCIDId = request.PerfilORCIDId
        };

        var avaliadorCriado = await _avaliadorRepository.CreateAsync(avaliador, cancellationToken);

        // Enviar email de boas-vindas
        try
        {
            var emailBody = EmailTemplateService.RegistroUsuarioTemplate(avaliadorCriado.Nome, "Avaliador");
            await _emailService.SendEmailAsync(
                avaliadorCriado.Email,
                "Bem-vindo ao AcadEvents!",
                emailBody,
                isHtml: true,
                cancellationToken);
        }
        catch
        {
            // Erro no envio de email não deve quebrar o fluxo principal
        }

        return avaliadorCriado;
    }

    public async Task<Avaliador> UpdateAsync(long id, AvaliadorRequestDTO request, CancellationToken cancellationToken = default)
    {
        var avaliador = await _avaliadorRepository.FindByIdAsync(id, cancellationToken);
        if (avaliador == null)
            throw new NotFoundException("Avaliador", id);

        // Verificar se o PerfilORCID existe (se fornecido)
        if (request.PerfilORCIDId.HasValue)
        {
            var perfil = await _perfilORCIDRepository.FindByIdAsync(request.PerfilORCIDId.Value, cancellationToken);
            if (perfil == null)
                throw new NotFoundException("Perfil ORCID", request.PerfilORCIDId.Value);
        }

        avaliador.Nome = request.Nome;
        avaliador.Email = request.Email;
        avaliador.Senha = request.Senha;
        avaliador.Instituicao = request.Instituicao;
        avaliador.Pais = request.Pais;
        avaliador.Especialidades = request.Especialidades ?? new List<string>();
        avaliador.NumeroAvaliacoes = request.NumeroAvaliacoes;
        avaliador.Disponibilidade = request.Disponibilidade;
        avaliador.PerfilORCIDId = request.PerfilORCIDId;

        return await _avaliadorRepository.UpdateAsync(avaliador, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var avaliador = await _avaliadorRepository.FindByIdAsync(id, cancellationToken);
        if (avaliador == null)
            throw new NotFoundException("Avaliador", id);
            
        await _avaliadorRepository.DeleteAsync(id, cancellationToken);
    }
}

