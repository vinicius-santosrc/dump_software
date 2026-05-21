using Dump.Application.Features.TrendingTopic;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/topics")]
public class TopicsController : ControllerBase
{
    private readonly TrendingTopicService _service;

    public TopicsController(
        TrendingTopicService service)
    {
        _service = service;
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending()
    {
        var topics = await _service.GetTrendingAsync();

        return Ok(topics);
    }
}