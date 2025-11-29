using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TrilhaTematicaController : ControllerBase
{
    private readonly TrilhaTematicaService _trilhaTematicaService;

    public TrilhaTematicaController(TrilhaTematicaService trilhaTematicaService)
    {
        _trilhaTematicaService = trilhaTematicaService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TrilhaTematicaResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
    {
        var trilhasTematicas = await _trilhaTematicaService.GetAllAsync(cancellationToken);
        var trilhasTematicasDTO = trilhasTematicas.Select(tt => TrilhaTematicaResponseDTO.ValueOf(tt)).ToList();
        return Ok(trilhasTematicasDTO);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TrilhaTematicaResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var trilhaTematica = await _trilhaTematicaService.GetByIdAsync(id, cancellationToken);
        if (trilhaTematica == null)
            return NotFound($"Trilha Temática com Id {id} não encontrada.");

        return Ok(TrilhaTematicaResponseDTO.ValueOf(trilhaTematica));
    }

    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<TrilhaTematicaResponseDTO>> Create(
        [FromBody] TrilhaTematicaRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var trilhaTematica = await _trilhaTematicaService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = trilhaTematica.Id }, TrilhaTematicaResponseDTO.ValueOf(trilhaTematica));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{trilhaTematicaId}/trilha/{trilhaId}")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<TrilhaTematicaResponseDTO>> AssociateToTrilha(
        long trilhaTematicaId,
        long trilhaId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var trilhaTematica = await _trilhaTematicaService.AssociateToTrilhaAsync(trilhaTematicaId, trilhaId, cancellationToken);
            return Ok(TrilhaTematicaResponseDTO.ValueOf(trilhaTematica));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Update(
        long id,
        [FromBody] TrilhaTematicaRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var trilhaTematica = await _trilhaTematicaService.UpdateAsync(id, request, cancellationToken);
            if (trilhaTematica == null)
                return NotFound($"Trilha Temática com Id {id} não encontrada.");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
    {
        var deletado = await _trilhaTematicaService.DeleteAsync(id, cancellationToken);
        if (!deletado)
            return NotFound($"Trilha Temática com Id {id} não encontrada.");

        return NoContent();
    }
}

