namespace AcadEvents.Exceptions;

public class UnauthorizedException : BaseApplicationException
{
    public UnauthorizedException(string message) : base(message) { }
    
    public UnauthorizedException() : base("Não autorizado. Credenciais inválidas.") { }
}

