public class Call
{
    public string Id { get; set; }

    public string CallerId { get; set; }

    public string ReceiverId { get; set; }

    public string Type { get; set; } // audio/video

    public DateTime StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public bool Missed { get; set; }
}