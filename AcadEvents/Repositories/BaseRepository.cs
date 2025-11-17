using Microsoft.EntityFrameworkCore;
using AcadEvents.Data;

namespace AcadEvents.Repositories;

public class BaseRepository<T> : IRepository<T> where T : class
{
    protected readonly AcadEventsDbContext _db;

    public BaseRepository(AcadEventsDbContext db) { _db = db; }

    public Task<List<T>> FindAllAsync(CancellationToken cancellationToken = default)
        => _db.Set<T>().ToListAsync(cancellationToken);

    public async Task<T?> FindByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var found = await _db.Set<T>().FindAsync(new object[] { id }, cancellationToken);
        return found;
    }

    public async Task<T> CreateAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _db.Set<T>().AddAsync(entity, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        _db.Set<T>().Update(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await FindByIdAsync(id, cancellationToken);
        if (entity == null)
            return false;

        _db.Set<T>().Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ExistsAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await FindByIdAsync(id, cancellationToken);
        return entity != null;
    }
}