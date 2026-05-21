using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Dump.Domain.Entities;

[BsonIgnoreExtraElements]
public class Memorie
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("user")]
    public User? User { get; set; } = new();

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("photoUrl")]
    public string PhotoUrl { get; set; } = string.Empty;

    [BsonElement("thumbnail")]
    public string Thumbnail { get; set; } = string.Empty;

    [BsonElement("likes")]
    public List<string> Likes { get; set; } = new();

    [BsonElement("comments")]
    public List<MemorieComment> Comments { get; set; } = new();

    [BsonElement("likesEnabled")]
    public bool LikesEnabled { get; set; } = true;

    [BsonElement("commentsEnabled")]
    public bool CommentsEnabled { get; set; } = true;

    [BsonElement("circleFriend")]
    public bool CircleFriends { get; set; } = false;

    [BsonElement("availableUntil")]
    public DateTime AvailableUntil { get; set; } = DateTime.UtcNow.AddHours(24);

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class MemorieComment
{
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("user")]
    public string User { get; set; } = string.Empty;

    [BsonElement("text")]
    public string Text { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class StoryGroup
{
    public User? User { get; set; }
    public List<Memorie> Stories { get; set; } = new();
    public DateTime LastStoryAt { get; set; }
}