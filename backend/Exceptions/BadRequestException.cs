namespace AcadEvents.Exceptions;

public class BadRequestException : BaseApplicationException
{
    public BadRequestException(string message) : base(message) { }
}

