using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Models;
using AcadEvents.Services;
using AcadEvents.Dtos;

namespace AcadEvents.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvaliacaoController(
    AvaliacaoService service,
    ConviteAvaliacaoService conviteService) : ControllerBase
{
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
    public async Task<ActionResult<AvaliacaoResponseDTO>> Create(
        [FromBody] AvaliacaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var avaliacao = await service.CreateAsync(request, cancellationToken);
            var response = AvaliacaoResponseDTO.ValueOf(avaliacao);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
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
    public async Task<ActionResult<List<AvaliacaoResponseDTO>>> GetMinhasAvaliacoes(CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        var avaliacoes = await service.FindByAvaliadorIdAsync(userId, cancellationToken);
        var response = avaliacoes.Select(AvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("convites")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> GetMeusConvites(CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        var convites = await conviteService.FindByAvaliadorIdAsync(userId, cancellationToken);
        var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpPost("convites/{conviteId}/aceitar")]
    public async Task<ActionResult<ConviteAvaliacaoResponseDTO>> AceitarConvite(long conviteId, CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        var convite = await conviteService.AceitarConviteAsync(conviteId, userId, cancellationToken);
        
        if (convite is null)
        {
            return BadRequest("Convite não encontrado ou já foi respondido.");
        }

        return Ok(ConviteAvaliacaoResponseDTO.ValueOf(convite));
    }

    [HttpPost("convites/{conviteId}/recusar")]
    public async Task<ActionResult<ConviteAvaliacaoResponseDTO>> RecusarConvite(
        long conviteId,
        [FromBody] RecusarConviteRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        if (string.IsNullOrWhiteSpace(request.MotivoRecusa))
        {
            return BadRequest("Motivo da recusa é obrigatório.");
        }

        var convite = await conviteService.RecusarConviteAsync(conviteId, userId, request.MotivoRecusa, cancellationToken);
        
        if (convite is null)
        {
            return BadRequest("Convite não encontrado ou já foi respondido.");
        }

        return Ok(ConviteAvaliacaoResponseDTO.ValueOf(convite));
    }
}

