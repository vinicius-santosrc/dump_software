namespace Dump.Application.DTOs;

public class WebRTCOfferDto
{
    public string CallerId { get; set; } = string.Empty;

    public string TargetUserId { get; set; } = string.Empty;

    public string Offer { get; set; } = string.Empty;
}