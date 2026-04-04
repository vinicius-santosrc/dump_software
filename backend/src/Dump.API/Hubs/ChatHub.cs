using Microsoft.AspNetCore.SignalR;
using Dump.Application.DTOs;
using Dump.Application.Features.Messages;

namespace Dump.API.Hubs;

public class ChatHub : Hub
{
    private readonly MessageService _messageService;

    public ChatHub(MessageService messageService)
    {
        _messageService = messageService;
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task SendMessage(SendMessageDto dto)
    {
        var message = await _messageService.CreateMessage(dto);

        await Clients.Group(dto.ConversationId)
            .SendAsync("ReceiveMessage", message);
    }
}