using Microsoft.AspNetCore.Http;

namespace AcadEvents.Dtos;

public class SubmissaoCreateCompleteDTO
{
    /// <summary>
    /// JSON string contendo os dados da submissão (SubmissaoRequestDTO serializado)
    /// </summary>
    public string DadosSubmissao { get; set; } = string.Empty;

    /// <summary>
    /// Arquivo da submissão (obrigatório)
    /// </summary>
    public IFormFile Arquivo { get; set; } = null!;

    /// <summary>
    /// JSON string contendo array de DOIs para referências (ex: ["10.1000/182", "10.1000/183"])
    /// </summary>
    public string? Dois { get; set; }
}

