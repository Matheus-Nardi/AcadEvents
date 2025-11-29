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
        try
        {
            var referencia = await _referenciaService.CreateFromDoiAsync(doi, submissaoId, cancellationToken);
            var referenciaComDOI = await _referenciaService.GetByIdAsync(referencia.Id, cancellationToken);
            if (referenciaComDOI == null)
            {
                return NotFound($"Referência {referencia.Id} não encontrada após criação.");
            }

            var response = ReferenciaResponseDTO.ValueOf(referenciaComDOI);
            return CreatedAtAction(
                nameof(GetById),
                new { id = response.Id },
                response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro interno ao processar a requisição.", error = ex.Message });
        }
    }

    [HttpGet("submissao/{submissaoId}")]
    public async Task<ActionResult<List<ReferenciaResponseDTO>>> GetBySubmissao(
        long submissaoId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var referencias = await _referenciaService.GetBySubmissaoIdAsync(submissaoId, cancellationToken);
            var response = referencias.Select(ReferenciaResponseDTO.ValueOf).ToList();
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro interno ao processar a requisição.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReferenciaResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var referencia = await _referenciaService.GetByIdAsync(id, cancellationToken);
        if (referencia == null)
        {
            return NotFound($"Referência {id} não encontrada.");
        }

        var response = ReferenciaResponseDTO.ValueOf(referencia);
        return Ok(response);
    }
}

