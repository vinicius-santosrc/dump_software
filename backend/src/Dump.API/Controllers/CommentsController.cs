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
}