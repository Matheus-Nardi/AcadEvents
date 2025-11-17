using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class OrganizadorRepository : BaseRepository<Organizador>
{
    public OrganizadorRepository(AcadEventsDbContext db) : base(db) { }
}

