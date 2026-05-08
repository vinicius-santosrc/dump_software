using Dump.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Notification
{
    [BsonId]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("userId")]
    public string UserId { get; set; }

    [BsonElement("fromUserId")]
    public string FromUserId { get; set; }

    [BsonElement("type")]
    public string Type { get; set; }

    [BsonElement("postId")]
    public string PostId { get; set; }

    [BsonElement("commentId")]
    public string? CommentId { get; set; }

    [BsonElement("isRead")]
    public bool IsRead { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class NotificationResponse
{
    public string Id { get; set; }
    public User User { get; set; }

    public User FromUser { get; set; }

    public string Type { get; set; }

    public string PostId { get; set; }

    public string? CommentId { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }
}