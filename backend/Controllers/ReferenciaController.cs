using System.Linq;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReferenciaController : ControllerBase
{
    private readonly ReferenciaService _referenciaService;

    public ReferenciaController(ReferenciaService referenciaService)
    {
        _referenciaService = referenciaService;
    }

    [HttpPost("submissao/{submissaoId}/doi")]
    public async Task<ActionResult<ReferenciaResponseDTO>> CreateFromDoi(
        long submissaoId,
        [FromQuery] string doi,
        CancellationToken cancellationToken = default)
    {
        var referencia = await _referenciaService.CreateFromDoiAsync(doi, submissaoId, cancellationToken);
        var referenciaComDOI = await _referenciaService.GetByIdAsync(referencia.Id, cancellationToken);
        var response = ReferenciaResponseDTO.ValueOf(referenciaComDOI);
        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            response);
    }

    [HttpGet("submissao/{submissaoId}")]
    public async Task<ActionResult<List<ReferenciaResponseDTO>>> GetBySubmissao(
        long submissaoId,
        CancellationToken cancellationToken = default)
    {
        var referencias = await _referenciaService.GetBySubmissaoIdAsync(submissaoId, cancellationToken);
        var response = referencias.Select(ReferenciaResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReferenciaResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var referencia = await _referenciaService.GetByIdAsync(id, cancellationToken);
        var response = ReferenciaResponseDTO.ValueOf(referencia);
        return Ok(response);
    }
}

