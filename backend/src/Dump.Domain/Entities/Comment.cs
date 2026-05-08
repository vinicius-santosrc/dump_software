using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Dump.Domain.Entities
{
    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty;

        // RELAÇÕES
        [BsonElement("postReference")]
        public string PostReference { get; set; } = string.Empty;

        [BsonElement("user")]
        public string UserId { get; set; } = string.Empty;

        [BsonIgnore]
        public User? User { get; set; }

        [BsonElement("parentId")]
        public string? ParentId { get; set; }

        // CONTEÚDO
        [BsonElement("content")]
        public string Content { get; set; } = string.Empty;

        // INTERAÇÕES
        [BsonElement("likes")]
        public List<string> Likes { get; set; } = new();

        [BsonElement("responses")]
        public List<string> ResponseIds { get; set; } = new(); // IDs dos replies

        [BsonIgnore]
        public List<Comment> Responses { get; set; } = new();

        // META
        [BsonElement("mentions")]
        public List<string> Mentions { get; set; } = new();

        [BsonElement("isPinned")]
        public bool IsPinned { get; set; } = false;

        // MODERAÇÃO
        [BsonElement("reports")]
        public List<string> Reports { get; set; } = new();

        // IA
        [BsonElement("ml")]
        public CommentML ML { get; set; } = new();

        // TEMPO
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("isDeleted")]
        public bool IsDeleted { get; set; } = false;
    }

    public class CommentML
    {
        [BsonElement("toxicityScore")]
        public double ToxicityScore { get; set; }

        [BsonElement("spamScore")]
        public double SpamScore { get; set; }

        [BsonElement("sentiment")]
        public string Sentiment { get; set; } = "neutral";
    }
}