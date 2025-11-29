using AcadEvents.Dtos;

namespace AcadEvents.Services;

public interface ICrossrefService
{
    Task<CrossrefWorkDTO?> GetWorkByDoiAsync(string doi, CancellationToken cancellationToken = default);
}

