using AcadEvents.Models;
using System.Text.Json.Serialization;

namespace AcadEvents.Dtos;

public record VerificarSubmissaoAutorDTO
{
    public bool ExisteSubmissao { get; init; }
    public long? SubmissaoId { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public StatusSubmissao? Status { get; init; }
    public bool PodeFazerSubmissao { get; init; }
}

