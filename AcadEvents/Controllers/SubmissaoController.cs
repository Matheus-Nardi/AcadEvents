using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissaoController(SubmissaoService submissaoService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
    {
        var submissoes = await submissaoService.GetAllAsync(cancellationToken);
        var response = submissoes.Select(SubmissaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<SubmissaoResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var submissao = await submissaoService.GetByIdAsync(id, cancellationToken);
        if (submissao is null)
        {
            return NotFound($"Submissão {id} não encontrada.");
        }

        return Ok(SubmissaoResponseDTO.ValueOf(submissao));
    }

    [HttpGet("trilha-tematica/{trilhaTematicaId}")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetByTrilhaTematica(
        long trilhaTematicaId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var submissoes = await submissaoService.GetByTrilhaTematicaIdAsync(trilhaTematicaId, cancellationToken);
            var response = submissoes.Select(SubmissaoResponseDTO.ValueOf).ToList();
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = "Autor")]
    public async Task<ActionResult<SubmissaoResponseDTO>> Create(
        [FromBody] SubmissaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Extrair o ID do autor do token
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
                
            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long autorId))
            {
                return Unauthorized(new { message = "Token inválido: ID do autor não encontrado." });
            }

            var submissao = await submissaoService.CreateAsync(request, autorId, cancellationToken);
            var response = SubmissaoResponseDTO.ValueOf(submissao);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<SubmissaoResponseDTO>> Update(
        long id,
        [FromBody] SubmissaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var submissao = await submissaoService.UpdateAsync(id, request, cancellationToken);
            if (submissao is null)
            {
                return NotFound($"Submissão {id} não encontrada.");
            }

            return Ok(SubmissaoResponseDTO.ValueOf(submissao));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
    {
        var deleted = await submissaoService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound($"Submissão {id} não encontrada.");
        }

        return NoContent();
    }
}


