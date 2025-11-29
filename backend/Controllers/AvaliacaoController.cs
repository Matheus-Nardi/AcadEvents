using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Models;
using AcadEvents.Services;
using AcadEvents.Dtos;
using AcadEvents.Repositories;

namespace AcadEvents.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvaliacaoController : ControllerBase
{
    private readonly AvaliacaoService service;
    private readonly ConviteAvaliacaoService conviteService;
    private readonly ILogger<AvaliacaoController> logger;

    public AvaliacaoController(
        AvaliacaoService service,
        ConviteAvaliacaoService conviteService,
        ILogger<AvaliacaoController> logger)
    {
        this.service = service;
        this.conviteService = conviteService;
        this.logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AvaliacaoResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var avaliacao = await service.FindByIdAsync(id, cancellationToken);
        
        return avaliacao is null
            ? NotFound()
            : Ok(AvaliacaoResponseDTO.ValueOf(avaliacao));
    }

    [HttpGet]
    public async Task<ActionResult<List<AvaliacaoResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
    {
        var avaliacoes = await service.FindAllAsync(cancellationToken);
        var response = avaliacoes.Select(AvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<AvaliacaoResponseDTO>> Create(
        [FromBody] AvaliacaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Avaliador tentando criar avaliação");

        // Extrai o ID do usuário do token
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long avaliadorId))
        {
            logger.LogWarning("ID do avaliador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        try
        {
            var avaliacao = await service.CreateAsync(request, avaliadorId, cancellationToken);
            var response = AvaliacaoResponseDTO.ValueOf(avaliacao);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Erro ao criar avaliação para avaliador {AvaliadorId}", avaliadorId);
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("avaliador/{avaliadorId}")]
    public async Task<ActionResult<List<AvaliacaoResponseDTO>>> GetByAvaliadorId(long avaliadorId, CancellationToken cancellationToken = default)
    {
        var avaliacoes = await service.FindByAvaliadorIdAsync(avaliadorId, cancellationToken);
        var response = avaliacoes.Select(AvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("minhas-avaliacoes")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<AvaliacaoResponseDTO>>> GetMinhasAvaliacoes(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Avaliador tentando recuperar suas avaliações");

        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            logger.LogWarning("ID do avaliador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        var avaliacoes = await service.FindByAvaliadorIdAsync(userId, cancellationToken);
        var response = avaliacoes.Select(AvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("convites")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetMeusConvites(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Avaliador tentando recuperar seus convites");

        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            logger.LogWarning("ID do avaliador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        var convites = await conviteService.FindByAvaliadorIdWhereResponseIsNullAsync(userId, cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpPost("convites/{conviteId}/aceitar")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<ConviteAvaliacaoResponseDTO>> AceitarConvite(long conviteId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Avaliador tentando aceitar convite {ConviteId}", conviteId);

        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            logger.LogWarning("ID do avaliador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        try
        {
            var convite = await conviteService.AceitarConviteAsync(conviteId, userId, cancellationToken);

            if (convite is null)
            {
                logger.LogWarning("Convite {ConviteId} não encontrado ou já foi respondido", conviteId);
                return BadRequest("Convite não encontrado ou já foi respondido.");
            }

            return Ok(ConviteAvaliacaoResponseDTO.ValueOf(convite));
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Erro ao aceitar convite {ConviteId} para avaliador {AvaliadorId}", conviteId, userId);
            return BadRequest(ex.Message);
        }

        }

    [HttpPost("convites/{conviteId}/recusar")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<ConviteAvaliacaoResponseDTO>> RecusarConvite(
        long conviteId,
        [FromBody] RecusarConviteRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Avaliador tentando recusar convite {ConviteId}", conviteId);

        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            logger.LogWarning("ID do avaliador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        if (string.IsNullOrWhiteSpace(request.MotivoRecusa))
        {
            logger.LogWarning("Motivo da recusa não fornecido para convite {ConviteId}", conviteId);
            return BadRequest("Motivo da recusa é obrigatório.");
        }

        try
        {
            var convite = await conviteService.RecusarConviteAsync(conviteId, userId, request.MotivoRecusa, cancellationToken);
            
            if (convite is null)
            {
                logger.LogWarning("Convite {ConviteId} não encontrado ou já foi respondido", conviteId);
                return BadRequest("Convite não encontrado ou já foi respondido.");
            }

            return Ok(ConviteAvaliacaoResponseDTO.ValueOf(convite));
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Erro ao recusar convite {ConviteId} para avaliador {AvaliadorId}", conviteId, userId);
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet("meus-convites/filtro")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetMeusConvitesComFiltro(
        [FromQuery] StatusConvite status = StatusConvite.Todos,
        CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                           ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        var convites = await conviteService.FindByAvaliadorComFiltroAsync(userId, status, cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("minhas")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<AvaliacaoResponseDTO>>> GetMinhasAvaliacoesCriadas(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Avaliador tentando recuperar todas suas avaliações criadas");

        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var avaliadorId))
        {
            logger.LogWarning("ID do avaliador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        try
        {
            var avaliacoes = await service.FindByAvaliadorIdAsync(avaliadorId, cancellationToken);
            var response = avaliacoes.Select(AvaliacaoResponseDTO.ValueOf).ToList();
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Erro ao buscar avaliações do avaliador {AvaliadorId}", avaliadorId);
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("submissao/{submissaoId}")]
    [Authorize(Roles = "Avaliador, Autor")]
    public async Task<ActionResult<List<AvaliacaoResponseDTO>>> GetAvaliacoesPorSubmissao(
        long submissaoId,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Avaliador tentando recuperar avaliações da submissão {SubmissaoId}", submissaoId);

        try
        {
            var avaliacoes = await service.FindBySubmissaoIdAsync(submissaoId, cancellationToken);
            var response = avaliacoes.Select(AvaliacaoResponseDTO.ValueOf).ToList();
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Erro ao buscar avaliações da submissão {SubmissaoId}", submissaoId);
            return BadRequest(ex.Message);
        }
    }
}

