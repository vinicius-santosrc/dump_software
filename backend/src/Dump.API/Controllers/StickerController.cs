using Dump.Application.Features.Messages.Compose;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/stickers")]
[Authorize]
public class StickerController : ControllerBase
{
    private readonly StickerService _stickerService;

    public StickerController(StickerService stickerService)
    {
        _stickerService = stickerService;
    }

    [HttpGet("custom")]
    public async Task<ActionResult<List<StickerResponse>>> GetCustomStickers(CancellationToken cancellationToken)
    {
        var stickers = await _stickerService.GetCustomStickersAsync(GetCurrentUserId(), cancellationToken);

        return Ok(stickers);
    }

    [HttpPost("custom")]
    [RequestSizeLimit(1_000_000)]
    public async Task<ActionResult<StickerResponse>> CreateCustomSticker(
        IFormFile file,
        [FromForm] string? name,
        CancellationToken cancellationToken
    )
    {
        try
        {
            await using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream, cancellationToken);

            var request = new CreateCustomStickerRequest
            {
                FileName = file.FileName,
                ContentType = file.ContentType,
                Content = memoryStream.ToArray(),
                Name = name
            };

            var sticker = await _stickerService.CreateCustomStickerAsync(GetCurrentUserId(), request, cancellationToken);

            return CreatedAtAction(nameof(GetCustomStickers), new { id = sticker.Id }, sticker);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpDelete("custom/{stickerId}")]
    public async Task<IActionResult> DeleteCustomSticker(string stickerId, CancellationToken cancellationToken)
    {
        try
        {
            await _stickerService.DeleteCustomStickerAsync(GetCurrentUserId(), stickerId, cancellationToken);

            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<StickerResponse>>> GetRecentStickers(CancellationToken cancellationToken)
    {
        var stickers = await _stickerService.GetRecentStickersAsync(GetCurrentUserId(), cancellationToken);

        return Ok(stickers);
    }

    [HttpPost("recent")]
    public async Task<ActionResult<List<StickerResponse>>> AddRecentSticker(
        [FromBody] AddRecentStickerRequest request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var stickers = await _stickerService.AddRecentStickerAsync(GetCurrentUserId(), request, cancellationToken);

            return Ok(stickers);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet("favorites")]
    public async Task<ActionResult<List<string>>> GetFavoriteStickerIds(CancellationToken cancellationToken)
    {
        var stickerIds = await _stickerService.GetFavoriteStickerIdsAsync(GetCurrentUserId(), cancellationToken);

        return Ok(stickerIds);
    }

    [HttpPost("favorites/toggle")]
    public async Task<ActionResult<List<string>>> ToggleFavoriteSticker(
        [FromBody] ToggleFavoriteStickerRequest request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var stickerIds = await _stickerService.ToggleFavoriteStickerAsync(GetCurrentUserId(), request, cancellationToken);

            return Ok(stickerIds);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("id")
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("userId");

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado.");
        }

        return userId;
    }
}
