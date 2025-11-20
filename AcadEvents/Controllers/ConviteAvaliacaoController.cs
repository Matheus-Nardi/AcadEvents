using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Services;
using AcadEvents.Dtos;

namespace AcadEvents.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConviteAvaliacaoController : ControllerBase
{
    private readonly ConviteAvaliacaoService _service;

    public ConviteAvaliacaoController(ConviteAvaliacaoService service)
    {
        _service = service;
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

    [HttpPost("organizador/{organizadorId}")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> Create(
        long organizadorId,
        [FromBody] ConviteAvaliacaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var convites = await _service.CreateAsync(organizadorId, request, cancellationToken);
            var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
            return CreatedAtAction(nameof(GetAll), response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("criar")]
    public async Task<ActionResult<List<ConviteAvaliacaoResponseDTO>>> CreateFromJWT(
        [FromBody] ConviteAvaliacaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var organizadorId))
        {
            return Unauthorized("Token JWT inválido ou sem identificador de usuário.");
        }

        try
        {
            var convites = await _service.CreateAsync(organizadorId, request, cancellationToken);
            var response = convites.Select(ConviteAvaliacaoResponseDTO.ValueOf).ToList();
            return CreatedAtAction(nameof(GetAll), response);
        }
        catch (ArgumentException ex)
        {
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

