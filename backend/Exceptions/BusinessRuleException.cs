namespace AcadEvents.Exceptions;

public class BusinessRuleException : BaseApplicationException
{
    public BusinessRuleException(string message) : base(message) { }
}