using AcadEvents.Models;
using AcadEvents.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace AcadEvents.Services;

public class ArquivoSubmissaoService
{
    private readonly ArquivoSubmissaoRepository _arquivoRepository;
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly ILogger<ArquivoSubmissaoService> _logger;
    private readonly string _storagePath;

    public ArquivoSubmissaoService(
        ArquivoSubmissaoRepository arquivoRepository,
        SubmissaoRepository submissaoRepository,
        ILogger<ArquivoSubmissaoService> logger,
        IConfiguration configuration)
    {
        _arquivoRepository = arquivoRepository;
        _submissaoRepository = submissaoRepository;
        _logger = logger;

        // Lê o caminho da configuração, com fallback para o padrão
        _storagePath = configuration["FileStorage:Path"] 
            ?? Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), 
                "AcadEvents", 
                "Artigos");
    }

    public async Task<ArquivoSubmissao> UploadAsync(long submissaoId, IFormFile arquivo, CancellationToken cancellationToken = default)
    {
        if (arquivo == null || arquivo.Length == 0)
        {
            throw new ArgumentException("Arquivo inválido ou vazio.", nameof(arquivo));
        }

        var submissao = await _submissaoRepository.FindByIdAsync(submissaoId, cancellationToken);
        if (submissao == null)
        {
            throw new ArgumentException($"Submissão com ID {submissaoId} não encontrada.", nameof(submissaoId));
        }

        Directory.CreateDirectory(_storagePath);

        var nomeOriginal = Path.GetFileName(arquivo.FileName);
        var extensao = Path.GetExtension(nomeOriginal);
        var nomeBase = Path.GetFileNameWithoutExtension(nomeOriginal);
        var nomeArquivoFisico = $"{nomeBase}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{extensao}";
        var caminhoCompleto = Path.Combine(_storagePath, nomeArquivoFisico);

        _logger.LogInformation("Salvando arquivo de submissão {NomeArquivo} em {Caminho}", nomeOriginal, caminhoCompleto);

        await using (var stream = new FileStream(caminhoCompleto, FileMode.Create, FileAccess.Write))
        {
            await arquivo.CopyToAsync(stream, cancellationToken);
        }

        var versao = await _arquivoRepository.ObterProximaVersaoAsync(submissaoId, cancellationToken);

        var entidade = new ArquivoSubmissao
        {
            NomeArquivo = nomeOriginal,
            Tipo = arquivo.ContentType ?? "application/octet-stream",
            Tamanho = arquivo.Length,
            Caminho = caminhoCompleto,
            DataUpload = DateTime.UtcNow,
            Versao = versao,
            SubmissaoId = submissaoId
        };

        return await _arquivoRepository.CreateAsync(entidade, cancellationToken);
    }

    public Task<ArquivoSubmissao?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _arquivoRepository.FindByIdAsync(id, cancellationToken);

    public Task<List<ArquivoSubmissao>> ListarPorSubmissaoAsync(long submissaoId, CancellationToken cancellationToken = default)
        => _arquivoRepository.FindBySubmissaoIdAsync(submissaoId, cancellationToken);

    public async Task<(byte[] bytes, string contentType, string fileName)?> ObterArquivoBytesAsync(long id, CancellationToken cancellationToken = default)
    {
        var arquivo = await GetByIdAsync(id, cancellationToken);
        if (arquivo == null)
        {
            return null;
        }

        if (!File.Exists(arquivo.Caminho))
        {
            _logger.LogWarning("Arquivo físico não encontrado no caminho: {Caminho}", arquivo.Caminho);
            return null;
        }

        var bytes = await File.ReadAllBytesAsync(arquivo.Caminho, cancellationToken);
        return (bytes, arquivo.Tipo, arquivo.NomeArquivo);
    }
}


