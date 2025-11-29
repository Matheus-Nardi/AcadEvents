using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AcadEvents.Dtos;
using AcadEvents.Services;
using System.IdentityModel.Tokens.Jwt;

namespace AcadEvents.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EventoController : ControllerBase
{
    private readonly EventoService _eventoService;
    private readonly ILogger<EventoController> _logger;

    public EventoController(
        EventoService eventoService,
        ILogger<EventoController> logger)
    {
        _eventoService = eventoService;
        _logger = logger;
    }

    [HttpGet("all")]
    public async Task<ActionResult<List<EventoResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
    {
        var eventos = await _eventoService.GetAllAsync(cancellationToken);
        var eventosDTO = eventos.Select(e => EventoResponseDTO.ValueOf(e)).ToList();
        return Ok(eventosDTO);
    }

    [HttpGet("meus-eventos")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<List<EventoResponseDTO>>> GetMeusEventos(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Organizador tentando recuperar seus eventos");

        // Extrai o ID do usuário do token
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
            
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorId))
        {
            _logger.LogWarning("ID do organizador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        try
        {
            var eventos = await _eventoService.GetByOrganizadorIdAsync(organizadorId, cancellationToken);
            var eventosDTO = eventos.Select(e => EventoResponseDTO.ValueOf(e)).ToList();
            return Ok(eventosDTO);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Erro ao buscar eventos do organizador {OrganizadorId}", organizadorId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventoResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var evento = await _eventoService.GetByIdAsync(id, cancellationToken);
        if (evento == null)
            return NotFound($"Evento com Id {id} não encontrado.");

        return Ok(EventoResponseDTO.ValueOf(evento));
    }

    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<EventoResponseDTO>> Create(
        [FromBody] EventoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Organizador tentando criar evento");

        // Extrai o ID do usuário do token
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorId))
        {
            _logger.LogWarning("ID do organizador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        try
        {
            var evento = await _eventoService.CreateAsync(organizadorId, request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = evento.Id }, EventoResponseDTO.ValueOf(evento));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Erro ao criar evento para organizador {OrganizadorId}", organizadorId);
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        long id,
        [FromBody] EventoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var evento = await _eventoService.UpdateAsync(id, request, cancellationToken);
            if (evento == null)
                return NotFound($"Evento com Id {id} não encontrado.");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
    {
        var deletado = await _eventoService.DeleteAsync(id, cancellationToken);
        if (!deletado)
            return NotFound($"Evento com Id {id} não encontrado.");

        return NoContent();
    }

    [HttpPost("{eventoId}/organizadores/{emailOrganizador}")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<EventoResponseDTO>> AddOrganizador(
        long eventoId,
        string emailOrganizador,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Organizador tentando adicionar outro organizador ao evento {EventoId}", eventoId);

        // Extrai o ID do usuário do token para validar permissões
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorAutenticadoId))
        {
            _logger.LogWarning("ID do organizador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        try
        {
            var evento = await _eventoService.AddOrganizadorAsync(eventoId, emailOrganizador, cancellationToken);
            return Ok(EventoResponseDTO.ValueOf(evento));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Erro ao adicionar organizador {EmailOrganizador} ao evento {EventoId}", emailOrganizador, eventoId);
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{eventoId}/organizadores/{organizadorId}")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<EventoResponseDTO>> RemoveOrganizador(
        long eventoId,
        long organizadorId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Organizador tentando remover outro organizador do evento {EventoId}", eventoId);

        // Extrai o ID do usuário do token para validar permissões
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorAutenticadoId))
        {
            _logger.LogWarning("ID do organizador não encontrado no token");
            return Unauthorized(new { message = "Token inválido" });
        }

        try
        {
            var evento = await _eventoService.RemoveOrganizadorAsync(eventoId, organizadorId, cancellationToken);
            return Ok(EventoResponseDTO.ValueOf(evento));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Erro ao remover organizador {OrganizadorId} do evento {EventoId}", organizadorId, eventoId);
            return BadRequest(ex.Message);
        }
    }
}
