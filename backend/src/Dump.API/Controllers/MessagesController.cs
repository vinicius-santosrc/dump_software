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

        // Envia em tempo real
        await _hub.Clients.Group(dto.ConversationId)
            .SendAsync("ReceiveMessage", message);

        return Ok(message);
    }

    [HttpGet("{conversationId}")]
    public async Task<IActionResult> GetMessages(string conversationId)
    {
        var messages = await _service.GetMessages(conversationId);
        return Ok(messages);
    }

}