namespace AcadEvents.Exceptions;

public abstract class BaseApplicationException : Exception
{
   protected BaseApplicationException(string message) : base(message) { }
}