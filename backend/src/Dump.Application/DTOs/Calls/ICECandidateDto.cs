namespace Dump.Application.DTOs;

public class ICECandidateDto
{
    public string FromUserId { get; set; } = string.Empty;
    public string ToUserId { get; set; } = string.Empty;

    public string Candidate { get; set; } = string.Empty;
}