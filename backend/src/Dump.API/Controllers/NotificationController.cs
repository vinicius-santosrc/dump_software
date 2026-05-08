using Dump.Application.Interfaces;
using Dump.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

using Dump.Application.Features.Messages;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _notificationService;
    private readonly INotificationRepository _repository;

    public NotificationController(NotificationService notificationService, INotificationRepository repository)
    {
        _notificationService = notificationService;
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string userId)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var notifications = await _repository.GetByUserIdAsync(userId);

        return Ok(notifications);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(string id)
    {
        await _repository.MarkAsReadAsync(id);
        return NoContent();
    }

}