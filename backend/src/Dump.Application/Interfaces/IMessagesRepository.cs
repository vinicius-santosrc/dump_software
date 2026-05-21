using Dump.Application.DTOs;
using Dump.Domain.Entities;
public interface IMessagesRepository
{
    Task InsertAsync(Message message);

    Task UpdateConversationLastMessageAsync(Message message);

    Task<List<Message>> GetByConversationIdAsync(string conversationId, int page = 1, int pageSize = 20);
    Task<Conversation> GetByConversationId(string conversationId);
    Task CreateConversationAsync(Conversation conversation);
    Task<List<Conversation>> GetConversationsByUserIdAsync(string userId);
    Task MarkAsReadAsync(string messageId, string userId);
    Task<Message?> GetByIdAsync(string id);
}