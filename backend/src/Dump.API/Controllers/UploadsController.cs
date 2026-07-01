using Dump.Application.DTOs.Uploads;
using Dump.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/uploads")]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IMediaStorageService _mediaStorageService;

    public UploadsController(
        IMediaStorageService mediaStorageService)
    {
        _mediaStorageService = mediaStorageService;
    }

    [HttpPost]
    [RequestSizeLimit(1024L * 1024L * 1024L)]
    public async Task<ActionResult<UploadMediaResponseDto>> Upload(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Arquivo inválido.");
        }

        var userId = User.FindFirst("id")?.Value
                  ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        await using var stream = file.OpenReadStream();

        var dto = new UploadMediaFileDto
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
            Content = stream
        };

        var result = await _mediaStorageService.UploadAsync(
            dto,
            userId,
            cancellationToken);

        return Ok(result);
    }
}