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
        return Ok(SubmissaoResponseDTO.ValueOf(submissao));
    }

    [HttpGet("trilha-tematica/{trilhaTematicaId}")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetByTrilhaTematica(
        long trilhaTematicaId,
        CancellationToken cancellationToken = default)
    {
        var submissoes = await submissaoService.GetByTrilhaTematicaIdAsync(trilhaTematicaId, cancellationToken);
        var response = submissoes.Select(SubmissaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("evento/{eventoId}")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetByEvento(
        long eventoId,
        CancellationToken cancellationToken = default)
    {
        var submissoes = await submissaoService.GetByEventoIdAsync(eventoId, cancellationToken);
        var response = submissoes.Select(SubmissaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpGet("autor/minhas")]
    [Authorize(Roles = "Autor")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetMinhasSubmissoes(
        CancellationToken cancellationToken = default)
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

    [HttpGet("avaliador/minhas")]
    [Authorize(Roles = "Avaliador")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetSubmissoesParaAvaliador(
        CancellationToken cancellationToken = default)
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

    [HttpGet("autor/verificar/{eventoId}/{trilhaTematicaId}")]
    [Authorize(Roles = "Autor")]
    public async Task<ActionResult<VerificarSubmissaoAutorDTO>> VerificarSubmissaoAutor(
        long eventoId,
        long trilhaTematicaId,
        CancellationToken cancellationToken = default)
    {
        // Extrair o ID do autor do token
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
            
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long autorId))
        {
            return Unauthorized(new { message = "Token inválido: ID do autor não encontrado." });
        }

        var resultado = await submissaoService.VerificarSubmissaoAutorAsync(
            autorId, 
            trilhaTematicaId, 
            eventoId, 
            cancellationToken);
        
        return Ok(resultado);
    }

    [HttpGet("{id:long}/versoes")]
    public async Task<ActionResult<List<SubmissaoResponseDTO>>> GetVersoes(
        long id,
        CancellationToken cancellationToken = default)
    {
        var versoes = await submissaoService.GetVersoesSubmissaoAsync(id, cancellationToken);
        var response = versoes.Select(SubmissaoResponseDTO.ValueOf).ToList();
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Autor")]
    public async Task<ActionResult<SubmissaoResponseDTO>> Create(
        [FromBody] SubmissaoRequestDTO request,
        CancellationToken cancellationToken = default)
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro interno ao processar a requisição.", error = ex.Message });
        }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<SubmissaoResponseDTO>> Update(
        long id,
        [FromBody] SubmissaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var submissao = await submissaoService.UpdateAsync(id, request, cancellationToken);
        return Ok(SubmissaoResponseDTO.ValueOf(submissao));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
    {
        await submissaoService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:long}/decidir-status")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<SubmissaoResponseDTO>> DecidirStatusRevisao(
        long id,
        [FromBody] DecidirStatusRevisaoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        // Extrair o ID do organizador do token JWT
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
            
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorId))
        {
            return Unauthorized(new { message = "Token JWT inválido: ID do organizador não encontrado no token." });
        }

        // O organizadorId é extraído do token JWT, não é passado como parâmetro
        var submissao = await submissaoService.DecidirStatusRevisaoAsync(id, organizadorId, request, cancellationToken);
        var response = SubmissaoResponseDTO.ValueOf(submissao);
        return Ok(response);
    }

    [HttpGet("{id:long}/status-avaliacao")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<StatusAvaliacaoDTO>> GetStatusAvaliacao(
        long id,
        CancellationToken cancellationToken = default)
    {
        // Extrair o ID do organizador do token JWT
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
            
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorId))
        {
            return Unauthorized(new { message = "Token JWT inválido: ID do organizador não encontrado no token." });
        }

        var status = await submissaoService.GetStatusAvaliacaoAsync(id, cancellationToken);
        return Ok(status);
    }
}


