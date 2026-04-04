namespace Dump.Application.Features.Messages;
using Dump.Application.DTOs;
public class MessageService
{
    private readonly IMessagesRepository _repository;

    public MessageService(IMessagesRepository repository)
    {
        _repository = repository;
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
            ReadBy = new List<string> { dto.UserId }
        };

        await _repository.InsertAsync(message);
        await _repository.UpdateConversationLastMessageAsync(message);

        return message;
    }

    public async Task<List<Message>> GetMessages(string conversationId)
    {
        return await _repository.GetByConversationIdAsync(conversationId);
    }
}