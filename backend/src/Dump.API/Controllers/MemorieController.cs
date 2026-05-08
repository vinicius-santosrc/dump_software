using Microsoft.AspNetCore.Mvc;
using Dump.Application.Features.Messages;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/memories")]
public class MemorieController : ControllerBase
{
    private readonly MemoriesService _memoriesService;

    public MemorieController(MemoriesService memoriesService)
    {
        _memoriesService = memoriesService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var story = await _memoriesService.GetById(id);
        return Ok(story);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetStoryByUser(string userId)
    {
        var stories = await _memoriesService.GetStoryByUser(userId);
        return Ok(stories);
    }

    [HttpGet("feed/{currentUserId}")]
    public async Task<IActionResult> GetStoriesFeed(string currentUserId)
    {
        var storiesFeed = await _memoriesService.GetAllByUser(currentUserId);
        return Ok(storiesFeed);
    }
}