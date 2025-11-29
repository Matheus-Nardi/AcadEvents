using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record SubmissaoResponseDTO
{
    public long Id { get; init; }
    public string Titulo { get; init; }
    public string Resumo { get; init; }
    public List<string> PalavrasChave { get; init; } = new();
    public DateTime DataSubmissao { get; init; }
    public DateTime DataUltimaModificacao { get; init; }
    public int Versao { get; init; }
    public StatusSubmissao Status { get; init; }
    public FormatoSubmissao Formato { get; init; }
    public long AutorId { get; init; }
    public string? AutorNome { get; init; }
    public long TrilhaTematicaId { get; init; }
    public string? TrilhaTematicaNome { get; init; }
    public long? SessaoId { get; init; }
    public long? DOIId { get; init; }

    public static SubmissaoResponseDTO ValueOf(Submissao submissao)
    {
        return new SubmissaoResponseDTO
        {
            Id = submissao.Id,
            Titulo = submissao.Titulo,
            Resumo = submissao.Resumo,
            PalavrasChave = submissao.PalavrasChave ?? new List<string>(),
            DataSubmissao = submissao.DataSubmissao,
            DataUltimaModificacao = submissao.DataUltimaModificacao,
            Versao = submissao.Versao,
            Status = submissao.Status,
            Formato = submissao.Formato,
            AutorId = submissao.AutorId,
            AutorNome = submissao.Autor?.Nome,
            TrilhaTematicaId = submissao.TrilhaTematicaId,
            TrilhaTematicaNome = submissao.TrilhaTematica?.Nome,
            SessaoId = submissao.SessaoId,
            DOIId = submissao.DOIId
        };
    }
}


