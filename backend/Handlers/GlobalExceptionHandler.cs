using AcadEvents.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AcadEvents.Handlers;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, 
        Exception exception, 
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = MapException(exception);

        // Log apropriado baseado no tipo de exceção
        if (statusCode >= 500)
        {
            _logger.LogError(exception, "Erro interno do servidor: {Message}", exception.Message);
        }
        else if (statusCode >= 400)
        {
            _logger.LogWarning(exception, "Erro de requisição: {Message}", exception.Message);
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        var problemDetails = CreateProblemDetails(httpContext, statusCode, title, detail, exception);

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        await httpContext.Response.WriteAsJsonAsync(problemDetails, jsonOptions, cancellationToken);

        return true;
    }

    private (int StatusCode, string Title, string Detail) MapException(Exception exception)
    {
        return exception switch
        {
            NotFoundException notFound => (StatusCodes.Status404NotFound, "Recurso não encontrado", notFound.Message),
            
            BadRequestException badRequest => (StatusCodes.Status400BadRequest, "Requisição inválida", badRequest.Message),
            
            BusinessRuleException businessRule => (StatusCodes.Status400BadRequest, "Regra de negócio violada", businessRule.Message),
            
            ValidationException validation => (StatusCodes.Status400BadRequest, "Erro de validação", validation.Message),
            
            UnauthorizedException unauthorized => (StatusCodes.Status401Unauthorized, "Não autorizado", unauthorized.Message),
            
            ForbiddenException forbidden => (StatusCodes.Status403Forbidden, "Acesso negado", forbidden.Message),
            
            ConflictException conflict => (StatusCodes.Status409Conflict, "Conflito", conflict.Message),
            
            ArgumentNullException argumentNull => (StatusCodes.Status400BadRequest, "Argumento obrigatório não fornecido", argumentNull.Message),
            
            ArgumentException argument => (StatusCodes.Status400BadRequest, "Argumento inválido", argument.Message),
            
            InvalidOperationException invalidOp => (StatusCodes.Status400BadRequest, "Operação inválida", invalidOp.Message),
            
            DbUpdateConcurrencyException concurrency => (StatusCodes.Status409Conflict, "Conflito de concorrência", "O recurso foi modificado por outro usuário. Por favor, recarregue e tente novamente."),
            
            DbUpdateException dbUpdate => HandleDbUpdateException(dbUpdate),
            
            _ => (StatusCodes.Status500InternalServerError, "Erro interno do servidor", "Ocorreu um erro inesperado. Tente novamente mais tarde.")
        };
    }

    private (int StatusCode, string Title, string Detail) HandleDbUpdateException(DbUpdateException dbUpdate)
    {
        var innerException = dbUpdate.InnerException;
        
        // Tratar violações de chave única (duplicatas)
        if (innerException?.Message.Contains("duplicate key") == true || 
            innerException?.Message.Contains("UNIQUE constraint") == true ||
            innerException?.Message.Contains("Cannot insert duplicate key") == true)
        {
            return (StatusCodes.Status409Conflict, "Conflito", "Já existe um registro com os mesmos dados.");
        }
        
        // Tratar violações de chave estrangeira
        if (innerException?.Message.Contains("FOREIGN KEY constraint") == true ||
            innerException?.Message.Contains("The DELETE statement conflicted") == true)
        {
            return (StatusCodes.Status400BadRequest, "Violação de integridade", "Não é possível realizar esta operação devido a dependências existentes.");
        }
        
        // Outros erros de banco de dados
        return (StatusCodes.Status500InternalServerError, "Erro no banco de dados", "Ocorreu um erro ao processar a operação no banco de dados.");
    }

    private ProblemDetails CreateProblemDetails(
        HttpContext httpContext,
        int statusCode,
        string title,
        string detail,
        Exception exception)
    {
        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Type = $"https://httpstatuses.com/{statusCode}",
            Instance = httpContext.Request.Path
        };

        // Adicionar erros de validação se for ValidationException
        if (exception is ValidationException validationException && validationException.Errors.Any())
        {
            problemDetails.Extensions["errors"] = validationException.Errors;
        }

        // Adicionar stack trace apenas em desenvolvimento
        var environment = httpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
        if (environment.IsDevelopment())
        {
            problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
        }

        return problemDetails;
    }
}
