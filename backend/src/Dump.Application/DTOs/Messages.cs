namespace Dump.Application.DTOs;
public class SendMessageDto
{
    public string ConversationId { get; set; }
    public string UserId { get; set; }
    public string Text { get; set; }
}

public class Message
{
    public string Id { get; set; }
    public string ConversationId { get; set; }
    public string SenderId { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> ReadBy { get; set; } = new();
}