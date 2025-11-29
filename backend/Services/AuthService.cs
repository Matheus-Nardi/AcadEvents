using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Services.Jwt;
using AcadEvents.Services;
namespace AcadEvents.Services;

public class AuthService
{
    private readonly AutorRepository _autorRepository;
    private readonly AvaliadorRepository _avaliadorRepository;
    private readonly OrganizadorRepository _organizadorRepository;
    private readonly HashService _hashService;
    private readonly JwtService _jwtService;

    public AuthService(
        AutorRepository autorRepository,
        AvaliadorRepository avaliadorRepository,
        OrganizadorRepository organizadorRepository,
        HashService hashService,
        JwtService jwtService)
    {
        _autorRepository = autorRepository;
        _avaliadorRepository = avaliadorRepository;
        _organizadorRepository = organizadorRepository;
        _hashService = hashService;
        _jwtService = jwtService;
    }

    public async Task<string?> AuthenticateAsync(LoginDto loginDto, CancellationToken cancellationToken = default)
    {
        // Busca o usuário nas tabelas específicas para obter o tipo correto
        Usuario? user = await FindUserByEmailAsync(loginDto.Email, cancellationToken);

        if (user == null || !_hashService.VerifyPassword(loginDto.Password, user.Senha))
        {
            return null;
        }

        return _jwtService.GenerateToken(user);
    }

    public async Task<Usuario?> GetUserByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await FindUserByIdAsync(id, cancellationToken);
    }

    private async Task<Usuario?> FindUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        // Busca primeiro em Autores
        var autor = await _autorRepository.FindByEmailAsync(email, cancellationToken);
        if (autor != null)
            return autor;

        // Busca em Avaliadores
        var avaliador = await _avaliadorRepository.FindByEmailAsync(email, cancellationToken);
        if (avaliador != null)
            return avaliador;

        // Busca em Organizadores
        var organizador = await _organizadorRepository.FindByEmailAsync(email, cancellationToken);
        if (organizador != null)
            return organizador;

        return null;
    }

    private async Task<Usuario?> FindUserByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        // Busca primeiro em Autores
        var autor = await _autorRepository.FindByIdAsync(id, cancellationToken);
        if (autor != null)
            return autor;

        // Busca em Avaliadores
        var avaliador = await _avaliadorRepository.FindByIdAsync(id, cancellationToken);
        if (avaliador != null)
            return avaliador;

        // Busca em Organizadores
        var organizador = await _organizadorRepository.FindByIdAsync(id, cancellationToken);
        if (organizador != null)
            return organizador;

        return null;
    }
}