using AcadEvents.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AcadEvents.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ArquivoSubmissaoController : ControllerBase
{
    private readonly ArquivoSubmissaoService _arquivoService;

    public ArquivoSubmissaoController(ArquivoSubmissaoService arquivoService)
    {
        _arquivoService = arquivoService;
    }

    [HttpPost("{submissaoId:long}")]
    public async Task<IActionResult> Upload(
        long submissaoId,
        IFormFile arquivo,
        CancellationToken cancellationToken = default)
    {
        if (arquivo == null)
        {
            return BadRequest(new { message = "Arquivo não foi enviado." });
        }

        try
        {
            var entidade = await _arquivoService.UploadAsync(submissaoId, arquivo, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = entidade.Id }, new
            {
                entidade.Id,
                entidade.NomeArquivo,
                entidade.Tipo,
                entidade.Tamanho,
                entidade.Caminho,
                entidade.Versao,
                entidade.SubmissaoId,
                entidade.DataUpload
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro interno ao salvar o arquivo.", error = ex.Message });
        }
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken = default)
    {
        var arquivo = await _arquivoService.GetByIdAsync(id, cancellationToken);
        if (arquivo == null)
        {
            return NotFound(new { message = $"Arquivo com ID {id} não encontrado." });
        }

        return Ok(arquivo);
    }

    [HttpGet("submissao/{submissaoId:long}")]
    public async Task<IActionResult> ListarPorSubmissao(long submissaoId, CancellationToken cancellationToken = default)
    {
        var arquivos = await _arquivoService.ListarPorSubmissaoAsync(submissaoId, cancellationToken);
        return Ok(arquivos);
    }

    [HttpGet("{id:long}/download")]
    public async Task<IActionResult> Download(long id, CancellationToken cancellationToken = default)
    {
        var arquivoData = await _arquivoService.ObterArquivoBytesAsync(id, cancellationToken);
        if (arquivoData == null)
        {
            return NotFound(new { message = $"Arquivo com ID {id} não encontrado." });
        }

        var (bytes, contentType, fileName) = arquivoData.Value;
        return File(bytes, contentType, fileName);
    }
}


