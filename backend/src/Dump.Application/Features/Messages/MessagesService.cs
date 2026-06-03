using Dump.Application.Interfaces;
namespace Dump.Application.Features.Messages;

using Dump.Application.DTOs;
using Dump.Application.Features.User;
using Dump.Domain.Entities;
public class MessageService
{
    private readonly IMessagesRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly UserService _userService;

    public MessageService(IMessagesRepository repository, IUserRepository userRepository, UserService userService)
    {
        _repository = repository;
        _userRepository = userRepository;
        _userService = userService;
    }

    public async Task<Message> CreateMessage(SendMessageDto dto)
    {
        var message = new Message
        {
            Id = Guid.NewGuid().ToString(),
            ConversationId = dto.ConversationId,
            SenderId = dto.UserId,
            Text = dto.Text,
            CreatedAt = DateTime.UtcNow,
            ReadBy = new List<string> { dto.UserId },
            TempId = dto.TempId
        };

        await _repository.InsertAsync(message);
        await _repository.UpdateConversationLastMessageAsync(message);

        return message;
    }

    public async Task<Conversation> GetConversationById(string conversationId)
    {
        var conversation = await _repository.GetByConversationId(conversationId);
        return conversation;
    }

    public async Task<List<MessageReceive>> GetMessages(
        string conversationId,
        DateTime? before = null,
        int limit = 25
    )
    {
        limit = Math.Clamp(limit, 1, 50);

        var messages = await _repository.GetByConversationIdAsync(
            conversationId,
            before,
            limit
        );

        var result = new List<MessageReceive>();

        if (messages.Count == 0)
        {
            return result;
        }

        var conversation = await _repository.GetByConversationId(conversationId);

        var senderIds = messages
            .Select(message => message.SenderId)
            .Where(senderId => !string.IsNullOrWhiteSpace(senderId))
            .Distinct()
            .ToList();

        var users = new Dictionary<string, User>();

        foreach (var senderId in senderIds)
        {
            var user = await _userService.GetById(senderId);

            if (user != null)
            {
                users[senderId] = user;
            }
        }

        foreach (var message in messages)
        {
            var enriched = new MessageReceive
            {
                Conversation = conversation,
                Sender = users.TryGetValue(message.SenderId, out var sender) ? sender : null,
                CreatedAt = message.CreatedAt,
                Id = message.Id,
                ReadBy = message.ReadBy,
                TempId = message.TempId,
                Text = message.Text
            };

            result.Add(enriched);
        }

        return result;
    }

    public async Task<Conversation> CreateConversation(List<string> participants)
    {
        participants = participants
            .Distinct()
            .OrderBy(x => x)
            .ToList();

        var existingConversations = new List<Conversation>();

        foreach (var participantId in participants)
        {
            var conversations = await _repository.GetConversationsByUserIdAsync(participantId);

            existingConversations.AddRange(conversations);
        }

        var existingConversation = existingConversations
            .FirstOrDefault(conversation =>
                conversation.Participants
                    .Distinct()
                    .OrderBy(x => x)
                    .SequenceEqual(participants)
            );

        if (existingConversation != null)
        {
            return existingConversation;
        }

        var conversation = new Conversation
        {
            Id = Guid.NewGuid().ToString(),
            Participants = participants,
            UpdatedAt = DateTime.UtcNow,
            LastMessage = new LastMessage
            {
                Text = "",
                SenderId = "",
                CreatedAt = DateTime.UtcNow
            }
        };

        await _repository.CreateConversationAsync(conversation);

        return conversation;
    }

    public async Task<List<object>> GetConversationsByUserId(string userId)
    {
        var conversations = await _repository.GetConversationsByUserIdAsync(userId);

        var result = new List<object>();

        foreach (var conversation in conversations)
        {
            var users = new List<User>();

            foreach (var participantId in conversation.Participants)
            {
                var user = await _userRepository.GetByIdAsync(participantId);

                if (user != null)
                {
                    users.Add(user);
                }
            }

            var unreadMessagesCount = await _repository.CountUnreadMessagesAsync(conversation.Id, userId);

            result.Add(new
            {
                conversation.Id,
                Participants = users,
                conversation.LastMessage,
                conversation.UpdatedAt,
                UnreadCount = new Dictionary<string, long>
                {
                    [userId] = unreadMessagesCount
                }
            });
        }

        return result;
    }

    public async Task<Message?> MarkAsRead(string messageId, string userId)
    {
        await _repository.MarkAsReadAsync(messageId, userId);

        return await _repository.GetByIdAsync(messageId);
    }
}