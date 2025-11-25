using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Models;
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

    [HttpGet("autor/minhas")]
    [Authorize(Roles = "Autor")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetMinhasSubmissoes(
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

            var submissoes = await submissaoService.GetByAutorIdAsync(autorId, cancellationToken);
            var response = submissoes.Select(SubmissaoResponseDTO.ValueOf).ToList();
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("avaliador/minhas")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetSubmissoesParaAvaliador(
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Extrair o ID do avaliador do token
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
                
            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long avaliadorId))
            {
                return Unauthorized(new { message = "Token inválido: ID do avaliador não encontrado." });
            }

            var submissoes = await submissaoService.GetForAvaliadorAvaliacaoAsync(avaliadorId, cancellationToken);
            var response = submissoes.Select(SubmissaoResponseDTO.ValueOf).ToList();
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
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

    [HttpPost("complete")]
    [Authorize(Roles = "Autor")]
    public async Task<ActionResult<SubmissaoResponseDTO>> CreateComplete(
        [FromForm] SubmissaoCreateCompleteDTO request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // 1. Validar token JWT e extrair autorId
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
                
            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long autorId))
            {
                return Unauthorized(new { message = "Token inválido: ID do autor não encontrado." });
            }

            // 2. Validar arquivo obrigatório
            if (request.Arquivo == null || request.Arquivo.Length == 0)
            {
                return BadRequest(new { message = "Arquivo é obrigatório na criação da submissão." });
            }

            // 3. Validar e deserializar dados da submissão
            if (string.IsNullOrWhiteSpace(request.DadosSubmissao))
            {
                return BadRequest(new { message = "Dados da submissão são obrigatórios." });
            }

            SubmissaoRequestDTO? dadosSubmissao;
            try
            {
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };
                jsonOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
                
                dadosSubmissao = JsonSerializer.Deserialize<SubmissaoRequestDTO>(request.DadosSubmissao, jsonOptions);
                
                if (dadosSubmissao == null)
                {
                    return BadRequest(new { message = "Falha ao deserializar dados da submissão." });
                }
            }
            catch (JsonException ex)
            {
                return BadRequest(new { message = $"Erro ao processar JSON dos dados da submissão: {ex.Message}" });
            }

            // 4. Deserializar DOIs se fornecidos
            List<string>? dois = null;
            if (!string.IsNullOrWhiteSpace(request.Dois))
            {
                try
                {
                    var jsonOptions = new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    };
                    dois = JsonSerializer.Deserialize<List<string>>(request.Dois, jsonOptions);
                }
                catch (JsonException ex)
                {
                    return BadRequest(new { message = $"Erro ao processar JSON de DOIs: {ex.Message}" });
                }
            }

            // 5. Chamar service para processar tudo
            var resultado = await submissaoService.CreateCompleteAsync(
                dadosSubmissao, 
                autorId, 
                request.Arquivo, 
                dois, 
                cancellationToken);

            // 6. Retornar resposta apropriada
            if (resultado.TemErrosParciais)
            {
                return StatusCode(201, new
                {
                    submissao = resultado.Submissao,
                    mensagem = "Submissão criada com sucesso, mas algumas referências falharam.",
                    referenciasCriadas = resultado.ReferenciasCriadas,
                    errosReferencias = resultado.ErrosReferencias
                });
            }

            return CreatedAtAction(nameof(GetById), new { id = resultado.Submissao.Id }, resultado.Submissao);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                message = "Erro interno ao processar a criação completa da submissão.", 
                error = ex.Message 
            });
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


