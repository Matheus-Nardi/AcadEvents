using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TrilhaController : ControllerBase
{
    private readonly TrilhaService _trilhaService;
    private readonly TrilhaTematicaService _trilhaTematicaService;

    public TrilhaController(
        TrilhaService trilhaService,
        TrilhaTematicaService trilhaTematicaService)
    {
        _trilhaService = trilhaService;
        _trilhaTematicaService = trilhaTematicaService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TrilhaResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
    {
        var trilhas = await _trilhaService.GetAllAsync(cancellationToken);
        var trilhasDTO = trilhas.Select(t => TrilhaResponseDTO.ValueOf(t)).ToList();
        return Ok(trilhasDTO);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TrilhaResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaService.GetByIdAsync(id, cancellationToken);
        return Ok(TrilhaResponseDTO.ValueOf(trilha));
    }

    [HttpGet("{trilhaId}/tematicas")]
    public async Task<ActionResult<List<TrilhaTematicaResponseDTO>>> GetTematicasByTrilhaId(
        long trilhaId,
        CancellationToken cancellationToken = default)
    {
        var trilhasTematicas = await _trilhaTematicaService.GetByTrilhaIdAsync(trilhaId, cancellationToken);
        var trilhasTematicasDTO = trilhasTematicas.Select(tt => TrilhaTematicaResponseDTO.ValueOf(tt)).ToList();
        return Ok(trilhasTematicasDTO);
    }

    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<TrilhaResponseDTO>> Create(
        [FromBody] TrilhaRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var trilha = await _trilhaService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = trilha.Id }, TrilhaResponseDTO.ValueOf(trilha));
    }

    [HttpPatch("{trilhaId}/evento/{eventoId}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> AssociateToEvento(
        long trilhaId,
        long eventoId,
        CancellationToken cancellationToken = default)
    {
        await _trilhaService.AssociateToEventoAsync(trilhaId, eventoId, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{trilhaId}/evento/{eventoId}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> RemoveFromEvento(
        long trilhaId,
        long eventoId,
        CancellationToken cancellationToken = default)
    {
        await _trilhaService.RemoveFromEventoAsync(trilhaId, eventoId, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Update(
        long id,
        [FromBody] TrilhaRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        await _trilhaService.UpdateAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
    {
        await _trilhaService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

