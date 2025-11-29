using AcadEvents.Data;
using AcadEvents.Models;

namespace AcadEvents.Repositories;

public class ConfiguracaoEventoRepository : BaseRepository<ConfiguracaoEvento>
{
    public ConfiguracaoEventoRepository(AcadEventsDbContext db) : base(db) { }
}

