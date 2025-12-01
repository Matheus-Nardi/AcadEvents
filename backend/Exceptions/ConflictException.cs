namespace AcadEvents.Exceptions;

public class ConflictException : BaseApplicationException
{
    public ConflictException(string message) : base(message) { }
}

