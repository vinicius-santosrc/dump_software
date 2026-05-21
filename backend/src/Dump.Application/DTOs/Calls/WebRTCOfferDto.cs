namespace Dump.Application.DTOs;

public class WebRTCOfferDto
{
    public string FromUserId { get; set; } = string.Empty;
    public string ToUserId { get; set; } = string.Empty;

    public string Offer { get; set; } = string.Empty;
}