using Microsoft.AspNetCore.Mvc;
using Dump.Application.Features.Post;
using Dump.Application.DTOs;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/comments")]
public class CommentsController : ControllerBase
{
    private readonly CommentsService _commentsService;

    public CommentsController(CommentsService commentsService)
    {
        _commentsService = commentsService;
    }

    [HttpGet("getByPost/{id}")]
    public async Task<IActionResult> GetByPostId(string id)
    {
        var comments = await _commentsService.GetByPostId(id);
        return Ok(comments);
    }

    [HttpPost("remove/{id}")]
    public async Task<IActionResult> Remove(string id)
    {
        await _commentsService.RemoveComment(id);
        return Ok();
    }

    [HttpPost("report/{id}")]
    public async Task<IActionResult> Report(string id, [FromQuery] string userId)
    {
        await _commentsService.ReportComment(id, userId);
        return Ok();
    }
}