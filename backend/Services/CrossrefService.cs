using System;
using System.Net.Http.Json;
using System.Text.Json;
using AcadEvents.Dtos;
using Microsoft.Extensions.Logging;

namespace AcadEvents.Services;

public class CrossrefService : ICrossrefService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CrossrefService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public CrossrefService(HttpClient httpClient, ILogger<CrossrefService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<CrossrefWorkDTO?> GetWorkByDoiAsync(string doi, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(doi))
        {
            _logger.LogWarning("DOI fornecido é nulo ou vazio");
            return null;
        }

        try
        {
            // Limpar e normalizar o DOI
            var cleanDoi = doi;
            
            _logger.LogInformation("Buscando work no Crossref para DOI: {DOI}", cleanDoi);

            // Construir a URL usando BaseAddress + path relativo
            // O HttpClient combina BaseAddress com o path relativo automaticamente
            // Usamos o path relativo diretamente para preservar a estrutura do DOI
            var relativePath = $"works/{cleanDoi}";
            
            _logger.LogDebug("Path relativo: {Path}", relativePath);
            
            // Quando BaseAddress está configurado, HttpClient combina automaticamente
            // A barra no DOI será preservada como parte do path
            var response = await _httpClient.GetAsync(relativePath, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Falha ao buscar work no Crossref. Status: {StatusCode}, DOI: {DOI}", 
                    response.StatusCode, doi);
                return null;
            }

            CrossrefResponseDTO? crossrefResponse;
            try
            {
                crossrefResponse = await response.Content.ReadFromJsonAsync<CrossrefResponseDTO>(_jsonOptions, cancellationToken);
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "Erro ao deserializar JSON do Crossref para DOI: {DOI}. Erro: {Message}", doi, jsonEx.Message);
                
                // Tentar ler o conteúdo bruto para debug
                var rawContent = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!string.IsNullOrEmpty(rawContent))
                {
                    var previewLength = Math.Min(500, rawContent.Length);
                    _logger.LogDebug("Conteúdo da resposta do Crossref: {Content}", rawContent.Substring(0, previewLength));
                }
                
                return null;
            }
            
            if (crossrefResponse?.Message == null)
            {
                _logger.LogWarning("Resposta do Crossref não contém dados válidos para DOI: {DOI}", doi);
                return null;
            }

            var work = MapToWorkDTO(crossrefResponse.Message);
            _logger.LogInformation("Work obtido com sucesso do Crossref para DOI: {DOI}", doi);
            
            return work;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Erro de requisição HTTP ao buscar work no Crossref para DOI: {DOI}", doi);
            return null;
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timeout ao buscar work no Crossref para DOI: {DOI}", doi);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao buscar work no Crossref para DOI: {DOI}", doi);
            return null;
        }
    }

    private static CrossrefWorkDTO MapToWorkDTO(CrossrefMessageDTO message)
    {
        var authors = message.Author?
            .Select(a => $"{a.Given} {a.Family}".Trim())
            .Where(a => !string.IsNullOrWhiteSpace(a))
            .ToList() ?? new List<string>();

        var title = message.Title?.FirstOrDefault() ?? string.Empty;
        var containerTitle = message.ContainerTitle?.FirstOrDefault() ?? string.Empty;
        var url = message.URL?.FirstOrDefault() ?? string.Empty;

        var publishedPrint = message.PublishedPrint?.DateParts?.FirstOrDefault();
        var publishedOnline = message.PublishedOnline?.DateParts?.FirstOrDefault();

        var publishedPrintStr = publishedPrint != null && publishedPrint.Count >= 1
            ? string.Join("-", publishedPrint.Take(3).Select(d => d.ToString().PadLeft(2, '0')))
            : null;

        var publishedOnlineStr = publishedOnline != null && publishedOnline.Count >= 1
            ? string.Join("-", publishedOnline.Take(3).Select(d => d.ToString().PadLeft(2, '0')))
            : null;

        return new CrossrefWorkDTO
        {
            DOI = message.DOI,
            Title = title,
            Author = authors,
            Publisher = message.Publisher,
            ContainerTitle = containerTitle,
            PublishedPrint = publishedPrintStr,
            PublishedOnline = publishedOnlineStr,
            Type = message.Type,
            URL = url,
            Abstract = message.Abstract
        };
    }
}

