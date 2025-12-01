using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ConfiguracaoEventoController : ControllerBase
{
    private readonly ConfiguracaoEventoService _configuracaoEventoService;

    public ConfiguracaoEventoController(ConfiguracaoEventoService configuracaoEventoService)
    {
        _configuracaoEventoService = configuracaoEventoService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ConfiguracaoEventoResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
    {
        var configuracoes = await _configuracaoEventoService.GetAllAsync(cancellationToken);
        var configuracoesDTO = configuracoes.Select(c => ConfiguracaoEventoResponseDTO.ValueOf(c)).ToList();
        return Ok(configuracoesDTO);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConfiguracaoEventoResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
    {
        var configuracao = await _configuracaoEventoService.GetByIdAsync(id, cancellationToken);
        return Ok(ConfiguracaoEventoResponseDTO.ValueOf(configuracao));
    }

    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<ConfiguracaoEventoResponseDTO>> Create(
        [FromBody] ConfiguracaoEventoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var configuracao = await _configuracaoEventoService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = configuracao.Id }, ConfiguracaoEventoResponseDTO.ValueOf(configuracao));
    }

    [HttpPost("evento/{eventoId}")]
    [Authorize(Roles = "Organizador")]
    public async Task<ActionResult<ConfiguracaoEventoResponseDTO>> Create(
        long eventoId,
        [FromBody] ConfiguracaoEventoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var configuracao = await _configuracaoEventoService.CreateAsync(eventoId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = configuracao.Id }, ConfiguracaoEventoResponseDTO.ValueOf(configuracao));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Update(
        long id,
        [FromBody] ConfiguracaoEventoRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        await _configuracaoEventoService.UpdateAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
    {
        await _configuracaoEventoService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

