using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AcadEvents.Dtos;
using AcadEvents.Services;
using System.IdentityModel.Tokens.Jwt;

namespace AcadEvents.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AuthService authService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Tentativa de login com email {Email}", loginDto.Email);

        var token = await _authService.AuthenticateAsync(loginDto, cancellationToken);

        if (token == null)
        {
            _logger.LogWarning("Tentativa de login falhou para o email {Email}", loginDto.Email);
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        _logger.LogInformation("Login bem-sucedido para o email {Email}", loginDto.Email);
        return Ok(new LoginResponseDto { Token = token });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Usuário tentando recuperar informações do perfil");

        // Tenta buscar o ID do usuário de diferentes formas
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
            
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long userId))
        {
            _logger.LogWarning("ID do usuário não encontrado no token. Claims disponíveis: {Claims}", 
                string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));
            return Unauthorized(new { message = "Token inválido" });
        }

        var user = await _authService.GetUserByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("Usuário com ID {UserId} não encontrado", userId);
            return NotFound(new { message = "Usuário não encontrado" });
        }

        // Retorna o DTO apropriado baseado no tipo do usuário
        return user switch
        {
            Models.Autor autor => Ok(AutorResponseDTO.ValueOf(autor)),
            Models.Avaliador avaliador => Ok(AvaliadorResponseDTO.ValueOf(avaliador)),
            Models.Organizador organizador => Ok(OrganizadorResponseDTO.ValueOf(organizador)),
            _ => Ok(new { Id = user.Id, Nome = user.Nome, Email = user.Email })
        };
    }
}

