
using System.Text.Json.Serialization;

namespace Dump.Application.DTOs;
public class GenericId
{
    [JsonPropertyName("id")]
    public string? Id { get; set; } = string.Empty;
}