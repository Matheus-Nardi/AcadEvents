namespace AcadEvents.Exceptions;

public class ForbiddenException : BaseApplicationException
{
    public ForbiddenException(string message) : base(message) { }
    
    public ForbiddenException() : base("Acesso negado. Você não tem permissão para realizar esta ação.") { }
}

