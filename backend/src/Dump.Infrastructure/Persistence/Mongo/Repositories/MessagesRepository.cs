using MongoDB.Driver;
using Dump.Application.DTOs;
using Dump.Domain.Entities;
using Dump.Application.Interfaces;

public class MessagesRepository : IMessagesRepository
{
    private readonly IMongoCollection<Message> _messages;
    private readonly IMongoCollection<Conversation> _conversations;

    public MessagesRepository(IMongoDatabase db)
    {
        _messages = db.GetCollection<Message>("messages");
        _conversations = db.GetCollection<Conversation>("conversations");
    }

    public async Task InsertAsync(Message message)
    {
        await _messages.InsertOneAsync(message);
    }

    public async Task UpdateConversationLastMessageAsync(Message message)
    {
        var update = Builders<Conversation>.Update
            .Set(c => c.LastMessage.Text, message.Text)
            .Set(c => c.LastMessage.SenderId, message.SenderId)
            .Set(c => c.LastMessage.CreatedAt, message.CreatedAt)
            .Set(c => c.UpdatedAt, message.CreatedAt);

        await _conversations.UpdateOneAsync(
            c => c.Id == message.ConversationId,
            update
        );
    }

    public async Task<List<Message>> GetByConversationIdAsync(string conversationId, int page = 1, int pageSize = 20)
    {
        return await _messages
            .Find(m => m.ConversationId == conversationId)
            .SortByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
    }
}
