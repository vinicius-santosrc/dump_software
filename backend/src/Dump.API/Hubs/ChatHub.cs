using Microsoft.AspNetCore.SignalR;
using Dump.Application.DTOs;
using Dump.Application.Features.Messages;
using Dump.Application.Features.User;

namespace Dump.API.Hubs;

public class ChatHub : Hub
{
    private static readonly Dictionary<string, string> _onlineUsers = new();
    private readonly MessageService _messageService;
    private readonly UserService _userService;

    public ChatHub(MessageService messageService, UserService userService)
    {
        _messageService = messageService;
        _userService = userService;
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

        var newMessage = new MessageReceive
        {
            Conversation = await _messageService.GetConversationById(message.ConversationId),
            Sender = await _userService.GetById(message.SenderId),
            CreatedAt = message.CreatedAt,
            Id = message.Id,
            ReadBy = message.ReadBy,
            TempId = message.TempId,
            Text = message.Text
        };

        await Clients.Group(dto.ConversationId)
            .SendAsync("ReceiveMessage", newMessage);

        // also notify user rooms (global inbox)
        foreach (var connection in _onlineUsers.Where(x => x.Key != null))
        {
            await Clients.Group($"user:{connection.Key}")
                .SendAsync("ReceiveMessage", newMessage);
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

    // Call related methods

    public async Task CallUser(CallUserDto dto)
    {
        await Clients.Group($"user:{dto.TargetUserId}")
            .SendAsync("IncomingCall", dto);
    }

    public async Task AcceptCall(CallUserDto dto)
    {
        await Clients.Group($"user:{dto.CallerId}")
            .SendAsync("CallAccepted", dto);
    }

    public async Task RejectCall(CallUserDto dto)
    {
        await Clients.Group($"user:{dto.CallerId}")
            .SendAsync("CallRejected", dto);
    }

    public async Task EndCall(CallUserDto dto)
    {
        await Clients.Group($"user:{dto.TargetUserId}")
            .SendAsync("CallEnded", dto);
    }

    //WebRTC signaling methods

    public async Task SendOffer(WebRTCOfferDto dto)
    {
        await Clients.Group($"user:{dto.ToUserId}")
            .SendAsync("ReceiveOffer", dto);
    }

    public async Task SendAnswer(WebRTCAnswerDto dto)
    {
        await Clients.Group($"user:{dto.ToUserId}")
            .SendAsync("ReceiveAnswer", dto);
    }

    public async Task SendIceCandidate(ICECandidateDto dto)
    {
        await Clients.Group($"user:{dto.ToUserId}")
            .SendAsync("ReceiveIceCandidate", dto);
    }
}