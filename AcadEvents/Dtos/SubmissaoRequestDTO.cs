using AcadEvents.Models;
using System.Text.Json.Serialization;

namespace AcadEvents.Dtos;

public record SubmissaoRequestDTO
{
    public string Titulo { get; init; }
    public string Resumo { get; init; }
    public List<string> PalavrasChave { get; init; } = new();
    public DateTime DataSubmissao { get; init; }
    public DateTime DataUltimaModificacao { get; init; }
    public int Versao { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public StatusSubmissao Status { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public FormatoSubmissao Formato { get; init; }
    public long EventoId { get; init; }
    public long TrilhaTematicaId { get; init; }
}


