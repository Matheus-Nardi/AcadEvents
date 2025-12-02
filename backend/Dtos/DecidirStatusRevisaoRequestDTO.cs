using AcadEvents.Models;

namespace AcadEvents.Dtos;

public record DecidirStatusRevisaoRequestDTO
{
    public StatusSubmissao Status { get; init; }
}

