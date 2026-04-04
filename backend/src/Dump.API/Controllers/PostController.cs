using Microsoft.AspNetCore.Mvc;
using Dump.Application.Features.Post;
using Dump.Application.DTOs;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/posts")]
public class PostController : ControllerBase
{
    private readonly PostService _postService;

    public PostController(PostService postService)
    {
        _postService = postService;
    }

    [HttpPost("getByUser")]
    public async Task<IActionResult> GetByUser(GenericId genericId)
    {
        var posts = await _postService.GetByUser(genericId.Id);
        return Ok(posts);
    }

    [HttpPost("getByUserProfile")]
    public async Task<IActionResult> GetByUserProfile(GenericId genericId)
    {
        var posts = await _postService.GetByUserProfile(genericId.Id);
        return Ok(posts);
    }


    [HttpPost("getById")]
    public async Task<IActionResult> GetById(GenericId genericId)
    {
        var post = await _postService.GetById(genericId.Id);
        return Ok(post);
    }

    public class HandleLikeRequest
    {
        public string PostId { get; set; }
        public string LikerId { get; set; }
    }

    [HttpPost("handleLike")]
    public async Task<IActionResult> HandeLike([FromBody] HandleLikeRequest request)
    {
        if (string.IsNullOrEmpty(request.PostId) || string.IsNullOrEmpty(request.LikerId))
            return BadRequest("postId and likerId are required");

        var post = await _postService.HandleLike(request.PostId, request.LikerId);
        return Ok(post);
    }
}