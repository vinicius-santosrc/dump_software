using Microsoft.AspNetCore.SignalR;
using Dump.Application.DTOs;
using Dump.Application.Features.Messages;
using Dump.Application.Features.User;
using System.Text.Json;
using System.Collections.Concurrent;

namespace Dump.API.Hubs;

public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<string, HashSet<string>> _onlineUsers = new();
    private static readonly object _onlineUsersLock = new();
    private readonly MessageService _messageService;
    private readonly UserService _userService;

    public ChatHub(MessageService messageService, UserService userService)
    {
        _messageService = messageService;
        _userService = userService;
    }

    private static bool AddOnlineConnection(string userId, string connectionId)
    {
        lock (_onlineUsersLock)
        {
            var connections = _onlineUsers.GetOrAdd(userId, _ => new HashSet<string>());
            var wasOffline = connections.Count == 0;
            connections.Add(connectionId);
            return wasOffline;
        }
    }

    private static bool RemoveOnlineConnection(string connectionId, out string? userId)
    {
        lock (_onlineUsersLock)
        {
            foreach (var pair in _onlineUsers)
            {
                if (!pair.Value.Remove(connectionId))
                {
                    continue;
                }

                userId = pair.Key;

                if (pair.Value.Count == 0)
                {
                    _onlineUsers.TryRemove(pair.Key, out _);
                    return true;
                }

                return false;
            }
        }

        userId = null;
        return false;
    }

    private static string[] GetOnlineUserIds()
    {
        lock (_onlineUsersLock)
        {
            return _onlineUsers
                .Where(pair => pair.Value.Count > 0)
                .Select(pair => pair.Key)
                .ToArray();
        }
    }

    private static string[] GetUserConnections(string userId)
    {
        lock (_onlineUsersLock)
        {
            return _onlineUsers.TryGetValue(userId, out var connections)
                ? connections.ToArray()
                : Array.Empty<string>();
        }
    }

    private Task SendToOnlineUser(string userId, string eventName, object payload)
    {
        var connectionIds = GetUserConnections(userId);

        if (connectionIds.Length == 0)
        {
            return Task.CompletedTask;
        }

        return Clients.Clients(connectionIds).SendAsync(eventName, payload);
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task JoinUserRoom(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return;
        }

        var becameOnline = AddOnlineConnection(userId, Context.ConnectionId);

        await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

        if (becameOnline)
        {
            await Clients.All.SendAsync("UserOnline", userId);
        }
    }

    public Task<string[]> GetOnlineUsers()
    {
        return Task.FromResult(GetOnlineUserIds());
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
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            var becameOnline = AddOnlineConnection(userId, Context.ConnectionId);

            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

            if (becameOnline)
            {
                await Clients.All.SendAsync("UserOnline", userId);
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var becameOffline = RemoveOnlineConnection(Context.ConnectionId, out var userId);

        if (becameOffline && !string.IsNullOrWhiteSpace(userId))
        {
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

        await SendToOnlineUser(dto.TargetUserId, "IncomingCall", dto);
    }

    public async Task AcceptCall(CallUserDto dto)
    {
        await SendToOnlineUser(dto.CallerId, "CallAccepted", dto);
    }

    public async Task RejectCall(CallUserDto dto)
    {
        await SendToOnlineUser(dto.CallerId, "CallRejected", dto);
    }

    public async Task EndCall(CallUserDto dto)
    {
        await SendToOnlineUser(dto.TargetUserId, "CallEnded", dto);
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

        await SendToOnlineUser(targetUserId, "CallCameraToggled", new
        {
            callerId,
            targetUserId,
            conversationId,
            cameraOff
        });
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

        await SendToOnlineUser(targetUserId, "CallMicrophoneToggled", new
        {
            callerId,
            targetUserId,
            conversationId,
            muted
        });
    }

    //WebRTC signaling methods

    public async Task SendOffer(JsonElement dto)
    {
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        await SendToOnlineUser(targetUserId, "ReceiveOffer", dto);
    }

    public async Task SendAnswer(JsonElement dto)
    {
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        await SendToOnlineUser(targetUserId, "ReceiveAnswer", dto);
    }

    public async Task SendIceCandidate(JsonElement dto)
    {
        var targetUserId = GetStringProperty(dto, "targetUserId", "TargetUserId");
        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return;
        }

        await SendToOnlineUser(targetUserId, "ReceiveIceCandidate", dto);
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