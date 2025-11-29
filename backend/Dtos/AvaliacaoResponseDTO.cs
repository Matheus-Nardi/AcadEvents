using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record AvaliacaoResponseDTO
{
    public long Id { get; init; }
    public DateTime DataCriacao { get; set; }
    public double NotaGeral { get; init; }
    public double NotaOriginalidade { get; init; }
    public double NotaMetodologia { get; init; }
    public double NotaRelevancia { get; init; }
    public double NotaRedacao { get; init; }
    public string Recomendacao { get; init; }
    public bool Confidencial { get; init; }
    public long AvaliadorId { get; init; }
    public string? AvaliadorNome { get; init; }
    public long SubmissaoId { get; init; }
    public string? SubmissaoTitulo { get; init; }

    public static AvaliacaoResponseDTO ValueOf(Avaliacao avaliacao)
    {
        return new AvaliacaoResponseDTO
        {
            Id = avaliacao.Id,
            DataCriacao =  avaliacao.DataCriacao,
            NotaGeral = avaliacao.NotaGeral,
            NotaOriginalidade = avaliacao.NotaOriginalidade,
            NotaMetodologia = avaliacao.NotaMetodologia,
            NotaRelevancia = avaliacao.NotaRelevancia,
            NotaRedacao = avaliacao.NotaRedacao,
            Recomendacao = avaliacao.Recomendacao,
            Confidencial = avaliacao.Confidencial,
            AvaliadorId = avaliacao.AvaliadorId,
            AvaliadorNome = avaliacao.Avaliador?.Nome,
            SubmissaoId = avaliacao.SubmissaoId,
            SubmissaoTitulo = avaliacao.Submissao?.Titulo
        };
    }
}


