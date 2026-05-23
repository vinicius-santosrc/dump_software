namespace Dump.Application.DTOs;

public class WebRTCAnswerDto
{
    public string CallerId { get; set; } = string.Empty;

    public string TargetUserId { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;
}