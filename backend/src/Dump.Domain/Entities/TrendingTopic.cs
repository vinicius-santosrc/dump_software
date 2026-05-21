namespace Dump.Domain.Entities;

public class TrendingTopic
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Slug { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public double Score { get; set; }

    public double VelocityScore { get; set; }

    public int MentionsCount { get; set; }

    public int PostsCount { get; set; }

    public int EngagementCount { get; set; }

    public int SharesCount { get; set; }

    public int SavesCount { get; set; }

    public string Language { get; set; } = "pt";

    public DateTime LastActivityAt { get; set; }

    public List<string> RelatedPostIds { get; set; } = [];
}