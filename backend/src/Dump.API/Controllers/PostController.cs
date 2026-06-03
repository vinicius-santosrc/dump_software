using Microsoft.AspNetCore.Mvc;
using Dump.Application.Features.Post;
using Dump.Application.DTOs;
using Dump.Domain.Entities;

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

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] Post post)
    {
        await _postService.CreatePost(post);
        return Ok(post);
    }

    public class FeedRequest
    {
        public string Id { get; set; } = string.Empty;
        public DateTime? Cursor { get; set; }
        public int Limit { get; set; } = 6;
    }

    [HttpPost("feed")]
    public async Task<IActionResult> GetByUser([FromBody] FeedRequest request)
    {
        var posts = await _postService.GetByUser(
            request.Id,
            request.Cursor,
            request.Limit
        );

        return Ok(posts);
    }

    public class ProfileFeedRequest
    {
        public string Id { get; set; } = string.Empty;
        public DateTime? Cursor { get; set; }
        public int Limit { get; set; } = 12;
    }

    [HttpPost("getByUserProfile")]
    public async Task<IActionResult> GetByUserProfile([FromBody] ProfileFeedRequest request)
    {
        var posts = await _postService.GetByUserProfile(
            request.Id,
            request.Cursor,
            request.Limit
        );

        return Ok(posts);
    }


    [HttpPost("getById")]
    public async Task<IActionResult> GetById(GenericId genericId)
    {
        var post = await _postService.GetById(genericId.Id);
        return Ok(post);
    }

    [HttpGet("{id}/media")]
    public async Task<IActionResult> GetMediaByPostId(string id)
    {
        var media = await _postService.GetMediaByPostId(id);
        return Ok(media);
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


    [HttpGet("dumps/getByUser/{id}")]
    public async Task<IActionResult> GetDumpsById(string id, [FromQuery] DateTime? cursor = null, [FromQuery] int limit = 6)
    {
        var posts = await _postService.GetDumpsById(id, cursor, limit);

        return Ok(posts);
    }

    [HttpGet("archived/getByUser/{id}")]
    public async Task<IActionResult> GetArchivedPostsById(string id)
    {
        var user = await _postService.GetArchivedByUser(id);

        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }


    [HttpPatch("{id}/archive")]

    public async Task<IActionResult> Archive(string id)

    {

        await _postService.ArchivePost(id);

        return Ok();

    }

    [HttpPatch("{id}/unarchive")]

    public async Task<IActionResult> Unarchive(string id)

    {

        await _postService.UnarchivePost(id);

        return Ok();

    }

    [HttpDelete("{id}")]

    public async Task<IActionResult> Delete(string id)

    {

        await _postService.DeletePost(id);

        return Ok();

    }

    [HttpPatch("{id}/restore")]

    public async Task<IActionResult> Restore(string id)

    {

        await _postService.RestorePost(id);

        return Ok();

    }
}