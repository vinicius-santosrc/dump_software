namespace Dump.Application.DTOs.Uploads;

public class UploadMediaResponseDto
{
    public string Id { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string MimeType { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public int? Width { get; set; }

    public int? Height { get; set; }

    public double? DurationSeconds { get; set; }

    public DateTime CreatedAt { get; set; }
}