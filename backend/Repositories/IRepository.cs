namespace AcadEvents.Repositories;

public interface IRepository<T> where T : class
{
    Task<List<T>> FindAllAsync(CancellationToken cancellationToken = default);
    Task<T?> FindByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<T> CreateAsync(T entity, CancellationToken cancellationToken = default);
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(long id, CancellationToken cancellationToken = default);
}