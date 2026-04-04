namespace Dump.Domain.Entities;

public class LastMessage
{
    public string Text { get; set; }
    public string SenderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
public class Conversation
{
    public string Id { get; set; }

    // Participantes da conversa
    public List<string> Participants { get; set; } = new();

    // Última mensagem (pra listar no sidebar rápido)
    public LastMessage LastMessage { get; set; }

    public DateTime UpdatedAt { get; set; }
}