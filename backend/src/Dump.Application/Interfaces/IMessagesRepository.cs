using Dump.Application.DTOs;
using Dump.Domain.Entities;
public interface IMessagesRepository
{
    Task InsertAsync(Message message);

    Task UpdateConversationLastMessageAsync(Message message);

    Task<List<Message>> GetByConversationIdAsync(string conversationId, int page = 1, int pageSize = 20);
}