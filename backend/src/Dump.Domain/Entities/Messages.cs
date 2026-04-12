using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace Dump.Domain.Entities;

public class LastMessage
{
    [BsonElement("text")]
    public string Text { get; set; }

    [BsonElement("senderId")]
    public string SenderId { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }
}
public class Conversation
{
    [BsonElement("_id")]
    public string Id { get; set; }

    // Participantes da conversa
    [BsonElement("participants")]
    public List<string> Participants { get; set; } = new();

    // Última mensagem (pra listar no sidebar rápido)
    [BsonElement("lastMessage")]
    public LastMessage? LastMessage { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}