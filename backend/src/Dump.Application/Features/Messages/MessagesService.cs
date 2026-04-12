using Dump.Application.Interfaces;
namespace Dump.Application.Features.Messages;

using Dump.Application.DTOs;
using Dump.Domain.Entities;
public class MessageService
{
    private readonly IMessagesRepository _repository;
    private readonly IUserRepository _userRepository;

    public MessageService(IMessagesRepository repository, IUserRepository userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
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

    public async Task<List<Message>> GetMessages(string conversationId)
    {
        return await _repository.GetByConversationIdAsync(conversationId);
    }

    public async Task<Conversation> CreateConversation(List<string> participants)
    {
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