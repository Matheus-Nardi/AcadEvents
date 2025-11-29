using System.Text.Json;
using System.Text.Json.Serialization;

namespace AcadEvents.Dtos;

public record CrossrefWorkDTO
{
    public string? DOI { get; init; }
    public string? Title { get; init; }
    public List<string>? Author { get; init; }
    public string? Publisher { get; init; }
    public string? ContainerTitle { get; init; }
    public string? PublishedPrint { get; init; }
    public string? PublishedOnline { get; init; }
    public string? Type { get; init; }
    public string? URL { get; init; }
    public string? Abstract { get; init; }
}

public record CrossrefResponseDTO
{
    public string Status { get; init; } = string.Empty;
    public CrossrefMessageDTO? Message { get; init; }
}

public record CrossrefMessageDTO
{
    public string? DOI { get; init; }
    public List<string>? Title { get; init; }
    public List<CrossrefAuthorDTO>? Author { get; init; }
    public string? Publisher { get; init; }
    public List<string>? ContainerTitle { get; init; }
    public CrossrefDateDTO? PublishedPrint { get; init; }
    public CrossrefDateDTO? PublishedOnline { get; init; }
    public string? Type { get; init; }
    
    [JsonConverter(typeof(UrlConverter))]
    public List<string>? URL { get; init; }
    
    public string? Abstract { get; init; }
}

// Conversor customizado para lidar com URL que pode vir como string ou array
public class UrlConverter : JsonConverter<List<string>>
{
    public override List<string>? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var url = reader.GetString();
            return url != null ? new List<string> { url } : null;
        }
        
        if (reader.TokenType == JsonTokenType.StartArray)
        {
            return JsonSerializer.Deserialize<List<string>>(ref reader, options);
        }
        
        // Se for null ou outro tipo, retornar null
        reader.Skip();
        return null;
    }

    public override void Write(Utf8JsonWriter writer, List<string>? value, JsonSerializerOptions options)
    {
        if (value == null || value.Count == 0)
        {
            writer.WriteNullValue();
        }
        else if (value.Count == 1)
        {
            writer.WriteStringValue(value[0]);
        }
        else
        {
            JsonSerializer.Serialize(writer, value, options);
        }
    }
}

public record CrossrefAuthorDTO
{
    public string? Given { get; init; }
    public string? Family { get; init; }
    public string? Sequence { get; init; }
}

public record CrossrefDateDTO
{
    public List<List<int>>? DateParts { get; init; }
}

