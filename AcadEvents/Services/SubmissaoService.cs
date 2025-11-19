using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;

namespace AcadEvents.Services;

public class SubmissaoService
{
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly AutorRepository _autorRepository;
    private readonly TrilhaTematicaRepository _trilhaTematicaRepository;
    private readonly SessaoRepository _sessaoRepository;
    private readonly DOIRepository _doiRepository;

    public SubmissaoService(
        SubmissaoRepository submissaoRepository,
        AutorRepository autorRepository,
        TrilhaTematicaRepository trilhaTematicaRepository,
        SessaoRepository sessaoRepository,
        DOIRepository doiRepository)
    {
        _submissaoRepository = submissaoRepository;
        _autorRepository = autorRepository;
        _trilhaTematicaRepository = trilhaTematicaRepository;
        _sessaoRepository = sessaoRepository;
        _doiRepository = doiRepository;
    }

    public Task<List<Submissao>> GetAllAsync(CancellationToken cancellationToken = default)
        => _submissaoRepository.FindAllAsync(cancellationToken);

    public Task<Submissao?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _submissaoRepository.FindByIdAsync(id, cancellationToken);

    public async Task<Submissao> CreateAsync(SubmissaoRequestDTO request, CancellationToken cancellationToken = default)
    {
        await ValidateReferencesAsync(request, cancellationToken);

        var submissao = MapToEntity(new Submissao(), request);
        return await _submissaoRepository.CreateAsync(submissao, cancellationToken);
    }

    public async Task<Submissao?> UpdateAsync(long id, SubmissaoRequestDTO request, CancellationToken cancellationToken = default)
    {
        var submissao = await _submissaoRepository.FindByIdAsync(id, cancellationToken);
        if (submissao is null)
        {
            return null;
        }

        await ValidateReferencesAsync(request, cancellationToken);

        MapToEntity(submissao, request);
        await _submissaoRepository.UpdateAsync(submissao, cancellationToken);
        return submissao;
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _submissaoRepository.DeleteAsync(id, cancellationToken);

    private Submissao MapToEntity(Submissao entity, SubmissaoRequestDTO request)
    {
        entity.Titulo = request.Titulo;
        entity.Resumo = request.Resumo;
        entity.PalavrasChave = request.PalavrasChave ?? new List<string>();
        entity.DataSubmissao = request.DataSubmissao;
        entity.DataUltimaModificacao = request.DataUltimaModificacao;
        entity.Versao = request.Versao;
        entity.Status = request.Status;
        entity.Formato = request.Formato;
        entity.AutorId = request.AutorId;
        entity.TrilhaTematicaId = request.TrilhaTematicaId;
        entity.SessaoId = request.SessaoId;
        entity.DOIId = request.DOIId;
        return entity;
    }

    private async Task ValidateReferencesAsync(SubmissaoRequestDTO request, CancellationToken cancellationToken)
    {
        if (!await _autorRepository.ExistsAsync(request.AutorId, cancellationToken))
        {
            throw new ArgumentException($"Autor {request.AutorId} não existe.");
        }

        if (!await _trilhaTematicaRepository.ExistsAsync(request.TrilhaTematicaId, cancellationToken))
        {
            throw new ArgumentException($"Trilha temática {request.TrilhaTematicaId} não existe.");
        }

        if (request.SessaoId.HasValue &&
            !await _sessaoRepository.ExistsAsync(request.SessaoId.Value, cancellationToken))
        {
            throw new ArgumentException($"Sessão {request.SessaoId} não existe.");
        }

        if (request.DOIId.HasValue &&
            !await _doiRepository.ExistsAsync(request.DOIId.Value, cancellationToken))
        {
            throw new ArgumentException($"DOI {request.DOIId} não existe.");
        }
    }
}


