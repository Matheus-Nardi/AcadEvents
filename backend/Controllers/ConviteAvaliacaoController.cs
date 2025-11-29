using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using AcadEvents.Services;
using AcadEvents.Dtos;
using AcadEvents.Repositories;

namespace AcadEvents.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConviteAvaliacaoController : ControllerBase
{
    private readonly ConviteAvaliacaoService _service;
    private readonly ILogger<ConviteAvaliacaoController> _logger;

    public ConviteAvaliacaoController(
        ConviteAvaliacaoService service,
        ILogger<ConviteAvaliacaoController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConviteAvaliacaoResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var convite = await _service.FindByIdAsync(id, cancellationToken);
        
        if (convite == null)
        {
            return NotFound($"Convite com Id {id} não encontrado.");
        }

        return Ok(ConviteAvaliacaoResponseDTO.ValueOf(convite));
    }

    [HttpGet]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
    {
        var convites = await _service.FindAllAsync(cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("avaliador/{avaliadorId}")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetByAvaliadorId(long avaliadorId, CancellationToken cancellationToken = default)
    {
        var convites = await _service.FindByAvaliadorIdAsync(avaliadorId, cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("submissao/{submissaoId}")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetBySubmissaoId(long submissaoId, CancellationToken cancellationToken = default)
    {
        var convites = await _service.FindBySubmissaoIdAsync(submissaoId, cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("meus-convites")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetMeusConvites(CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        var convites = await _service.FindByAvaliadorIdAsync(userId, cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("meus-convites/filtro")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetMeusConvitesComFiltro(
        [FromQuery] StatusConvite status = StatusConvite.Todos,
        CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        var convites = await _service.FindByAvaliadorComFiltroAsync(userId, status, cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> Create(
        [FromBody] ConviteAvaliacaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Organizador tentando criar convites de avaliação");

        // Extrai o ID do usuário do token
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var organizadorId))
        {
            _logger.LogWarning("ID do organizador não encontrado no token");
            return Unauthorized(new { message = "Token JWT inválido ou sem identificador de usuário." });
        }

        try
        {
            var convites = await _service.CreateAsync(organizadorId, request, cancellationToken);
            var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
            return CreatedAtAction(nameof(GetAll), response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Erro ao criar convites de avaliação para organizador {OrganizadorId}", organizadorId);
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/aceitar")]
    public async Task<ActionResult<ConviteAvaliacaoResponseDTO>> AceitarConvite(long id, CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var avaliadorId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        var convite = await _service.AceitarConviteAsync(id, avaliadorId, cancellationToken);
        
        if (convite == null)
        {
            return BadRequest("Convite não encontrado ou já foi respondido.");
        }

        return Ok(ConviteAvaliacaoResponseDTO.ValueOf(convite));
    }

    [HttpPost("{id}/recusar")]
    public async Task<ActionResult<ConviteAvaliacaoResponseDTO>> RecusarConvite(
        long id,
        [FromBody] RecusarConviteRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var avaliadorId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        if (string.IsNullOrWhiteSpace(request.MotivoRecusa))
        {
            return BadRequest("Motivo da recusa é obrigatório.");
        }

        var convite = await _service.RecusarConviteAsync(id, avaliadorId, request.MotivoRecusa, cancellationToken);
        
        if (convite == null)
        {
            return BadRequest("Convite não encontrado ou já foi respondido.");
        }

        return Ok(ConviteAvaliacaoResponseDTO.ValueOf(convite));
    }
}

