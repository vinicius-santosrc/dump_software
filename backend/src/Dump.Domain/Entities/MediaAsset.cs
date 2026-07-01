using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Dump.Domain.Entities;

public class MediaAsset
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string OwnerUserId { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string MimeType { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string RelativePath { get; set; } = string.Empty;

    public string PublicUrl { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public int? Width { get; set; }

    public int? Height { get; set; }

    public int? DurationSeconds { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}