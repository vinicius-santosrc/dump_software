using Microsoft.AspNetCore.SignalR;
using Dump.Application.DTOs;
using Dump.Application.Features.Messages;
using Dump.Application.Features.User;
using System.Text.Json;

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
        if (!string.IsNullOrWhiteSpace(userId))
        {
            _onlineUsers[userId] = Context.ConnectionId;
        }

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
        dto.Caller = await _userService.GetById(dto.CallerId);

        if (_onlineUsers.TryGetValue(
            dto.TargetUserId,
            out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("IncomingCall", dto);
        }
    }

    public async Task AcceptCall(CallUserDto dto)
    {
        if (_onlineUsers.TryGetValue(
            dto.CallerId,
            out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("CallAccepted", dto);
        }
    }

    public async Task RejectCall(CallUserDto dto)
    {
        if (_onlineUsers.TryGetValue(
            dto.CallerId,
            out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("CallRejected", dto);
        }
    }

    public async Task EndCall(CallUserDto dto)
    {
        if (_onlineUsers.TryGetValue(
            dto.TargetUserId,
            out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("CallEnded", dto);
        }
    }

    public async Task ToggleCallCamera(JsonElement dto)
    {
        var callerId = GetStringProperty(dto, "callerId", "CallerId");
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        var conversationId = GetStringProperty(dto, "conversationId", "ConversationId");
        var cameraOff = GetBoolProperty(dto, "cameraOff", "CameraOff");

        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        if (_onlineUsers.TryGetValue(targetUserId, out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("CallCameraToggled", new
                {
                    callerId,
                    targetUserId,
                    conversationId,
                    cameraOff
                });
        }
    }

    public async Task ToggleCallMicrophone(JsonElement dto)
    {
        var callerId = GetStringProperty(dto, "callerId", "CallerId");
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        var conversationId = GetStringProperty(dto, "conversationId", "ConversationId");
        var muted = GetBoolProperty(dto, "muted", "Muted");

        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        if (_onlineUsers.TryGetValue(targetUserId, out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("CallMicrophoneToggled", new
                {
                    callerId,
                    targetUserId,
                    conversationId,
                    muted
                });
        }
    }

    //WebRTC signaling methods

    public async Task SendOffer(JsonElement dto)
    {
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        if (_onlineUsers.TryGetValue(targetUserId, out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("ReceiveOffer", dto);
        }
    }

    public async Task SendAnswer(JsonElement dto)
    {
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        if (_onlineUsers.TryGetValue(targetUserId, out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("ReceiveAnswer", dto);
        }
    }

    public async Task SendIceCandidate(JsonElement dto)
    {
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        if (_onlineUsers.TryGetValue(targetUserId, out var connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("ReceiveIceCandidate", dto);
        }
    }

    private static string GetStringProperty(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (element.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.String)
            {
                return property.GetString() ?? string.Empty;
            }
        }

        return string.Empty;
    }

    private static bool GetBoolProperty(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (element.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.True)
            {
                return true;
            }

            if (element.TryGetProperty(propertyName, out property) &&
                property.ValueKind == JsonValueKind.False)
            {
                return false;
            }
        }

        return false;
    }
}