using Microsoft.AspNetCore.Mvc;
using Dump.Application.Features.Post;
using Dump.Application.DTOs;
using Microsoft.AspNetCore.SignalR;
using Dump.API.Hubs;
using Dump.Application.Features.Messages;

namespace Dump.API.Controllers;

[ApiController]
[Route("messages")]
public class MessagesController : ControllerBase
{
    private readonly MessageService _service;
    private readonly IHubContext<ChatHub> _hub;

    public MessagesController(MessageService service, IHubContext<ChatHub> hub)
    {
        _service = service;
        _hub = hub;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(SendMessageDto dto)
    {
        var message = await _service.CreateMessage(dto);

        return Ok(message);
    }

    [HttpGet("{conversationId}")]
    public async Task<IActionResult> GetMessages(
        string conversationId,
        [FromQuery] DateTime? before = null,
        [FromQuery] int limit = 25
    )
    {
        var messages = await _service.GetMessages(conversationId, before, limit);
        return Ok(messages);
    }

    [HttpGet("conversation/{conversationId}")]
    public async Task<IActionResult> GetConversationById(string conversationId)
    {
        var messages = await _service.GetConversationById(conversationId);
        return Ok(messages);
    }

    [HttpPost("conversation")]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationDto dto)
    {
        if (dto.Participants == null || dto.Participants.Count < 2)
            return BadRequest("Uma conversa precisa de pelo menos 2 participantes.");

        var conversation = await _service.CreateConversation(dto.Participants);
        return Ok(conversation);
    }

    [HttpGet("conversation/user/{userId}")]
    public async Task<IActionResult> GetConversationsByUserId(string userId)
    {
        var conversations = await _service.GetConversationsByUserId(userId);
        return Ok(conversations);
    }

    [HttpPost("read")]
    public async Task<IActionResult> MarkAsRead(ReadMessage body)
    {
        if (body == null || string.IsNullOrEmpty(body.MessageId) || string.IsNullOrEmpty(body.UserId))
            return BadRequest("Invalid body");

        var message = await _service.MarkAsRead(body.MessageId, body.UserId);

        if (message == null)
            return NotFound("Message not found");

        await _hub.Clients.Group(message.ConversationId)
            .SendAsync("MessageRead", message);

        return Ok(message);
    }
}