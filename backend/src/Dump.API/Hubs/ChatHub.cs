using Microsoft.AspNetCore.SignalR;
using Dump.Application.DTOs;
using Dump.Application.Features.Messages;

namespace Dump.API.Hubs;

public class ChatHub : Hub
{
    private static readonly Dictionary<string, string> _onlineUsers = new();
    private readonly MessageService _messageService;

    public ChatHub(MessageService messageService)
    {
        _messageService = messageService;
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task JoinUserRoom(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
    }

    public async Task SendMessage(SendMessageDto dto)
    {
        var message = await _messageService.CreateMessage(dto);

        await Clients.Group(dto.ConversationId)
            .SendAsync("ReceiveMessage", message);

        // also notify user rooms (global inbox)
        foreach (var connection in _onlineUsers.Where(x => x.Key != null))
        {
            await Clients.Group($"user:{connection.Key}")
                .SendAsync("ReceiveMessage", message);
        }
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            _onlineUsers[userId] = Context.ConnectionId;

            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

            await Clients.All.SendAsync("UserOnline", userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _onlineUsers.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;

        if (userId != null)
        {
            _onlineUsers.Remove(userId);

            await Clients.All.SendAsync("UserOffline", userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task Typing(string conversationId, string userId)
    {
        await Clients.Group(conversationId)
            .SendAsync("Typing", new { conversationId, userId });
    }
    public async Task StopTyping(string conversationId, string userId)
    {
        await Clients.Group(conversationId)
            .SendAsync("StopTyping", new { conversationId, userId });
    }
}