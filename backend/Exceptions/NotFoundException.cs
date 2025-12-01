namespace AcadEvents.Exceptions;

public class NotFoundException : BaseApplicationException
{
    public NotFoundException(string message) : base(message) { }
    
    public NotFoundException(string resourceName, object id) 
        : base($"{resourceName} com Id {id} não encontrado.") { }
}

