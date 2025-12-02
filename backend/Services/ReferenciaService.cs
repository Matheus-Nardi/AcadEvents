using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using Microsoft.Extensions.Logging;
using AcadEvents.Exceptions;

namespace AcadEvents.Services;

public class ReferenciaService
{
    private readonly ReferenciaRepository _referenciaRepository;
    private readonly DOIRepository _doiRepository;
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly ICrossrefService _crossrefService;
    private readonly ILogger<ReferenciaService> _logger;

    public ReferenciaService(
        ReferenciaRepository referenciaRepository,
        DOIRepository doiRepository,
        SubmissaoRepository submissaoRepository,
        ICrossrefService crossrefService,
        ILogger<ReferenciaService> logger)
    {
        _referenciaRepository = referenciaRepository;
        _doiRepository = doiRepository;
        _submissaoRepository = submissaoRepository;
        _crossrefService = crossrefService;
        _logger = logger;
    }

    public async Task<Referencia> CreateFromDoiAsync(
        string doi,
        long submissaoId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(doi))
        {
            throw new BadRequestException("DOI não pode ser nulo ou vazio.");
        }

        // Validar que a Submissão existe e é válida
        var submissao = await _submissaoRepository.FindByIdAsync(submissaoId, cancellationToken);
        if (submissao == null)
        {
            throw new NotFoundException("Submissão", submissaoId);
        }

        _logger.LogInformation("Criando referência a partir do DOI: {DOI}", doi);

        // 1. Buscar work no Crossref
        var work = await _crossrefService.GetWorkByDoiAsync(doi, cancellationToken);
        if (work == null)
        {
            _logger.LogWarning("DOI {DOI} não encontrado no Crossref ou inválido.", doi);
            throw new NotFoundException($"DOI {doi} não encontrado no Crossref ou inválido.");
        }

     
        // 2. Verificar se DOI já existe, senão criar
        var doiCodigo = work.DOI ?? doi.Trim();
        var doiEntity = await _doiRepository.FindByCodigoAsync(doiCodigo, cancellationToken);
        
        if (doiEntity == null)
        {
            _logger.LogInformation("Criando nova entidade DOI para: {DOI}", doiCodigo);
            doiEntity = new DOI
            {
                Codigo = doiCodigo,
                Url = work.URL ?? $"https://doi.org/{doiCodigo}",
                DataRegistro = DateTime.UtcNow,
                Valido = true
            };
            doiEntity = await _doiRepository.CreateAsync(doiEntity, cancellationToken);
        }
        else
        {
            _logger.LogInformation("DOI {DOI} já existe no banco de dados. Reutilizando.", doiCodigo);
        }

        // 3. Extrair ano da data de publicação
        var ano = ExtractYear(work.PublishedOnlineDateParts, work.PublishedPrintDateParts, doi);
        // 4. Criar Referencia
        var autores = work.Author != null && work.Author.Any()
            ? string.Join("; ", work.Author)
            : string.Empty;

        var referencia = new Referencia
        {
            Autores = autores,
            Titulo = work.Title ?? string.Empty,
            Ano = ano,
            Publicacao = work.ContainerTitle ?? work.Publisher ?? string.Empty,
            Abstract = work.Abstract,
            TipoPublicacao = work.Type,
            Publisher = work.Publisher,
            SubmissaoId = submissaoId,
            DOIId = doiEntity.Id
        };

        _logger.LogInformation("Criando referência no banco de dados para DOI: {DOI}", doiCodigo);
        return await _referenciaRepository.CreateAsync(referencia, cancellationToken);
    }

    public async Task<List<Referencia>> GetBySubmissaoIdAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        return await _referenciaRepository.FindBySubmissaoIdAsync(submissaoId, cancellationToken);
    }

    public async Task<Referencia> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var referencia = await _referenciaRepository.FindByIdWithDOIAsync(id, cancellationToken);
        if (referencia == null)
            throw new NotFoundException("Referência", id);
        return referencia;
    }

    private int ExtractYear(List<int>? publishedOnlineDateParts, List<int>? publishedPrintDateParts, string doi)
    {
        // Priorizar published-online, depois published-print
        var dateParts = publishedOnlineDateParts ?? publishedPrintDateParts;
        
        if (dateParts == null || dateParts.Count == 0)
        {
            var currentYear = DateTime.UtcNow.Year;
            _logger.LogWarning("- DateParts é null ou vazio. Retornando ano atual: {Year}", currentYear);
            return currentYear;
        }

        
        var year = dateParts[0];
        return year;
    }
}

