using Dump.Domain.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Dump.Application.DTOs;
public class SendMessageDto
{
    public string ConversationId { get; set; }
    public string UserId { get; set; }
    public string Text { get; set; }
    public string TempId { get; set; }

}

public class Message
{
    public string Id { get; set; }
    public string ConversationId { get; set; }
    public string SenderId { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> ReadBy { get; set; } = new();
    public string? TempId { get; set; }
}

public class MessageReceive
{
    public string Id { get; set; }
    public Conversation Conversation { get; set; }
    public User Sender { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> ReadBy { get; set; } = new();
    public string? TempId { get; set; }

}

public class CreateConversationDto
{
    public List<string> Participants { get; set; } = new();
}

public class ReadMessage
{
    public string MessageId { get; set; }
    public string UserId { get; set; }
}