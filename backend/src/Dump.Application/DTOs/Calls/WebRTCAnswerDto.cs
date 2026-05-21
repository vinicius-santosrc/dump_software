namespace Dump.Application.DTOs;

public class WebRTCAnswerDto
{
    public string FromUserId { get; set; } = string.Empty;
    public string ToUserId { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;
}