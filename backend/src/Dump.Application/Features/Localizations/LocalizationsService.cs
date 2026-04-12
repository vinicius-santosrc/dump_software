using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Dump.Application.Features.Localizations;

public class LocalizationsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public LocalizationsService(IConfiguration config)
    {
        _httpClient = new HttpClient();
        _config = config;
    }

    public async Task<IEnumerable<object>> Search(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            throw new ArgumentException("Query inválida");

        var apiKey = _config["Google:ApiKey"];

        var url = $"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={query}&language=pt-BR&key={apiKey}";

        var response = await _httpClient.GetStringAsync(url);

        using var json = JsonDocument.Parse(response);

        var results = json.RootElement
            .GetProperty("predictions")
            .EnumerateArray()
            .Select(p => new
            {
                name = p.GetProperty("description").GetString(),
                placeId = p.GetProperty("place_id").GetString()
            });

        return results;
    }

    public async Task<object> GetDetails(string placeId)
    {
        var apiKey = _config["Google:ApiKey"];

        var url = $"https://maps.googleapis.com/maps/api/place/details/json?place_id={placeId}&key={apiKey}";

        var response = await _httpClient.GetStringAsync(url);

        using var json = JsonDocument.Parse(response);

        var result = json.RootElement.GetProperty("result");
        var location = result.GetProperty("geometry").GetProperty("location");

        return new
        {
            name = result.GetProperty("name").GetString(),
            address = result.GetProperty("formatted_address").GetString(),
            lat = location.GetProperty("lat").GetDouble(),
            lng = location.GetProperty("lng").GetDouble()
        };
    }
}
