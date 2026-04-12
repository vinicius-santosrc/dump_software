using Microsoft.AspNetCore.Mvc;
using Dump.Application.Features.Localizations;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/localizations")]
public class LocalizationsController : ControllerBase
{
    private readonly LocalizationsService _service;

    public LocalizationsController(LocalizationsService service)
    {
        _service = service;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        var results = await _service.Search(query);
        return Ok(results);
    }

    [HttpGet("{placeId}")]
    public async Task<IActionResult> GetDetails(string placeId)
    {
        var data = await _service.GetDetails(placeId);
        return Ok(data);
    }
}