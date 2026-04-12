using MongoDB.Bson.Serialization.Attributes;

namespace Dump.Domain.Entities;

public class Post
{
    [BsonElement("id")]
    public string? Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("user")]
    public string User { get; set; } = string.Empty;

    [BsonElement("caption")]
    public string Caption { get; set; } = string.Empty;

    [BsonElement("media")]
    public List<PostMedia> Media { get; set; } = new();

    [BsonElement("location")]
    public PostLocation? Location { get; set; }

    [BsonElement("hashtags")]
    public List<string> Hashtags { get; set; } = new();

    [BsonElement("mentions")]
    public List<string> Mentions { get; set; } = new();

    [BsonElement("likes")]
    public List<string> Likes { get; set; } = new();

    [BsonElement("saves")]
    public List<string> Saves { get; set; } = new();

    [BsonElement("reports")]
    public List<string> Reports { get; set; } = new();

    [BsonElement("comments")]
    public List<string> Comments { get; set; } = new();

    [BsonElement("visibility")]
    public string Visibility { get; set; } = "public";

    [BsonElement("ml")]
    public PostML ML { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class PostResponse
{
    [BsonElement("id")]
    public string? Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("user")]
    public User User { get; set; }

    [BsonElement("caption")]
    public string Caption { get; set; } = string.Empty;

    [BsonElement("media")]
    public List<PostMedia> Media { get; set; } = new();

    [BsonElement("location")]
    public PostLocation? Location { get; set; }

    [BsonElement("hashtags")]
    public List<string> Hashtags { get; set; } = new();

    [BsonElement("mentions")]
    public List<string> Mentions { get; set; } = new();

    [BsonElement("likes")]
    public List<string> Likes { get; set; } = new();

    [BsonElement("saves")]
    public List<string> Saves { get; set; } = new();

    [BsonElement("reports")]
    public List<string> Reports { get; set; } = new();

    [BsonElement("comments")]
    public List<string> Comments { get; set; } = new();

    [BsonElement("visibility")]
    public string Visibility { get; set; } = "public";

    [BsonElement("ml")]
    public PostML ML { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class PostMedia
{
    [BsonElement("url")]
    public string Url { get; set; } = string.Empty;

    [BsonElement("width")]
    public string Width { get; set; } = string.Empty;

    [BsonElement("height")]
    public string Height { get; set; } = string.Empty;

    [BsonElement("type")]
    public string Type { get; set; } = "image";
}

public class PostLocation
{
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("lat")]
    public double Lat { get; set; }

    [BsonElement("long")]
    public double Long { get; set; }
}

public class PostComment
{
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("user")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("text")]
    public string Text { get; set; } = string.Empty;

    [BsonElement("likes")]
    public List<string> Likes { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PostML
{
    [BsonElement("engagementScore")]
    public double EngagementScore { get; set; }

    [BsonElement("relevanceScore")]
    public double RelevanceScore { get; set; }

    [BsonElement("qualityScore")]
    public double QualityScore { get; set; }

    [BsonElement("userInteractionScore")]
    public UserInteractionScore UserInteractionScore { get; set; } = new();

    [BsonElement("contentFeatures")]
    public ContentFeatures ContentFeatures { get; set; } = new();

    [BsonElement("topics")]
    public List<string> Topics { get; set; } = new();

    [BsonElement("language")]
    public string Language { get; set; } = "pt";
}

public class UserInteractionScore
{
    [BsonElement("likes")]
    public int Likes { get; set; }

    [BsonElement("comments")]
    public int Comments { get; set; }

    [BsonElement("shares")]
    public int Shares { get; set; }

    [BsonElement("saves")]
    public int Saves { get; set; }

    [BsonElement("watchTime")]
    public int WatchTime { get; set; }
}

public class ContentFeatures
{
    [BsonElement("hasFace")]
    public bool HasFace { get; set; }

    [BsonElement("hasText")]
    public bool HasText { get; set; }

    [BsonElement("brightness")]
    public double Brightness { get; set; }

    [BsonElement("colorfulness")]
    public double Colorfulness { get; set; }
}