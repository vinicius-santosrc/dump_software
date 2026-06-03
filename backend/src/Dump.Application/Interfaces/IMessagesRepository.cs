using Dump.Application.DTOs;
using Dump.Domain.Entities;
public interface IMessagesRepository
{
    Task InsertAsync(Message message);

    Task UpdateConversationLastMessageAsync(Message message);

    Task<List<Message>> GetByConversationIdAsync(string conversationId,
        DateTime? before = null,
        int limit = 25);
    Task<Conversation> GetByConversationId(string conversationId);
    Task CreateConversationAsync(Conversation conversation);
    Task<List<Conversation>> GetConversationsByUserIdAsync(string userId);
    Task MarkAsReadAsync(string messageId, string userId);
    Task<Message?> GetByIdAsync(string id);
    Task<long> CountUnreadMessagesAsync(string conversationId, string userId);
}