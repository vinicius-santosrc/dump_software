namespace Dump.Application.DTOs;

public class ICECandidateDto
{
    public string CallerId { get; set; } = string.Empty;

    public string TargetUserId { get; set; } = string.Empty;

    public string Candidate { get; set; } = string.Empty;
}