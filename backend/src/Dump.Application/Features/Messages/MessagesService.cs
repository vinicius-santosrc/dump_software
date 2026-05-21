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

    public async Task<List<MessageReceive>> GetMessages(string conversationId)
    {
        var messages = await _repository.GetByConversationIdAsync(conversationId);

        var result = new List<MessageReceive>();

        foreach (var message in messages)
        {
            var enriched = new MessageReceive
            {
                Conversation = await _repository.GetByConversationId(message.ConversationId),
                Sender = await _userService.GetById(message.SenderId),
                CreatedAt = message.CreatedAt,
                Id = message.Id,
                ReadBy = message.ReadBy,
                TempId = message.TempId,
                Text = message.Text
            };

            result.Add(enriched);
        }

        return result.Cast<MessageReceive>().ToList();
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
                    users.Add(user);
            }

            result.Add(new
            {
                conversation.Id,
                Participants = users,
                conversation.LastMessage,
                conversation.UpdatedAt
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