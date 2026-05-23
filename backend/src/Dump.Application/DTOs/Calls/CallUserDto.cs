using Dump.Domain.Entities;

namespace Dump.Application.DTOs;

public class CallUserDto
{
    public string CallerId { get; set; } = string.Empty;

    public User? Caller { get; set; }

    public string TargetUserId { get; set; } = string.Empty;

    // audio | video
    public string Type { get; set; } = "audio";

    public string ConversationId { get; set; } = string.Empty;
}