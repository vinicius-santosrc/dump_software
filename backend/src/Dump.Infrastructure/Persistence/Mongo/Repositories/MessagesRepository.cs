using MongoDB.Driver;
using Dump.Application.DTOs;
using Dump.Domain.Entities;
using Dump.Application.Interfaces;

public class MessagesRepository : IMessagesRepository
{
    private readonly IMongoCollection<Message> _messages;
    private readonly IMongoCollection<Conversation> _conversations;

    public MessagesRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("dump_db");
        var databaseDev = mongoClient.GetDatabase("dump_dev");
        _messages = database.GetCollection<Message>("messages");
        _conversations = databaseDev.GetCollection<Conversation>("conversations");
    }

    public async Task InsertAsync(Message message)
    {
        await _messages.InsertOneAsync(message);
    }

    public async Task UpdateConversationLastMessageAsync(Message message)
    {
        var update = Builders<Conversation>.Update
    .Set(c => c.LastMessage, new LastMessage
    {
        Text = message.Text,
        SenderId = message.SenderId,
        CreatedAt = message.CreatedAt
    })
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
            // .Skip((page - 1) * pageSize)
            // .Limit(pageSize)
            .ToListAsync();
    }

    public async Task<Conversation> GetByConversationId(string conversationId)
    {
        return await _conversations
            .Find(c => c.Id == conversationId)
            .FirstOrDefaultAsync();
    }

    public async Task CreateConversationAsync(Conversation conversation)
    {
        await _conversations.InsertOneAsync(conversation);
    }

    public async Task<List<Conversation>> GetConversationsByUserIdAsync(string userId)
    {
        var filter = Builders<Conversation>.Filter.AnyEq(c => c.Participants, userId);

        var result = await _conversations
            .Find(filter)
            .SortByDescending(c => c.UpdatedAt)
            .ToListAsync();

        return result;
    }

    public async Task<long> CountUnreadMessagesAsync(string conversationId, string userId)
    {
        var filter = Builders<Message>.Filter.And(
            Builders<Message>.Filter.Eq(message => message.ConversationId, conversationId),
            Builders<Message>.Filter.Ne(message => message.SenderId, userId),
            Builders<Message>.Filter.Not(
                Builders<Message>.Filter.AnyEq(message => message.ReadBy, userId)
            )
        );

        return await _messages.CountDocumentsAsync(filter);
    }

    public async Task MarkAsReadAsync(string messageId, string userId)
    {
        var update = Builders<Message>.Update.AddToSet(m => m.ReadBy, userId);

        await _messages.UpdateOneAsync(
            m => m.Id == messageId,
            update
        );
    }

    public async Task<Message?> GetByIdAsync(string id)
    {
        return await _messages
           .Find(m => m.Id == id)
           .FirstOrDefaultAsync();
    }
}
