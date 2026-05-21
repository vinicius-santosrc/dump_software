using System.Text.RegularExpressions;
using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using TrendingTopicEntity = Dump.Domain.Entities.TrendingTopic;

namespace Dump.Application.Features.TrendingTopic;

public class TrendingTopicService
{
    private readonly ITrendingRepository _repository;

    public TrendingTopicService(
        ITrendingRepository repository)
    {
        _repository = repository;
    }

    public async Task ProcessPostAsync(Dump.Domain.Entities.Post post)
    {
        EnsureMlData(post);

        var topics = ExtractTopics(post)
            .Distinct()
            .ToList();

        foreach (var topic in topics)
        {
            var slug = NormalizeTopic(topic);

            var existing = await _repository
                .GetBySlugAsync(slug);

            if (existing == null)
            {
                existing = new TrendingTopicEntity
                {
                    Slug = slug,
                    DisplayName = topic,
                    MentionsCount = 0,
                    PostsCount = 0,
                    EngagementCount = 0,
                    SharesCount = 0,
                    SavesCount = 0,
                    VelocityScore = 0,
                    RelatedPostIds = new List<string>()
                };
            }

            ApplyDecay(existing);

            existing.MentionsCount += 1;
            existing.PostsCount += 1;
            existing.SharesCount += post.ML.UserInteractionScore.Shares;
            existing.SavesCount += post.Saves.Count;
            existing.EngagementCount +=
                post.Likes.Count +
                post.Comments.Count +
                post.Saves.Count;

            existing.Score += CalculateScore(post);
            existing.VelocityScore += CalculateVelocity(post);
            existing.Language = post.ML.Language;
            existing.LastActivityAt = DateTime.UtcNow;

            if (!existing.RelatedPostIds.Contains(post.Id))
            {
                existing.RelatedPostIds.Add(post.Id);
            }

            if (string.IsNullOrWhiteSpace(existing.Id))
            {
                existing.Id = Guid.NewGuid().ToString();
            }

            var topicExists = await _repository
                .GetBySlugAsync(slug);

            if (topicExists == null)
            {
                await _repository.CreateAsync(existing);
            }
            else
            {
                await _repository.UpdateAsync(existing);
            }
        }
    }

    private void ApplyDecay(TrendingTopicEntity topic)
    {
        var hours = Math.Max(
            1,
            (DateTime.UtcNow - topic.LastActivityAt).TotalHours
        );

        var decayFactor = Math.Pow(0.95, hours);

        topic.Score *= decayFactor;
        topic.VelocityScore *= decayFactor;
    }

    public async Task<List<TrendingTopicEntity>> GetTrendingAsync(int limit = 20)
    {
        return await _repository.GetTrendingAsync(limit);
    }

    public List<string> ExtractTopics(Dump.Domain.Entities.Post post)
    {
        EnsureMlData(post);

        var topics = new List<string>();

        if (post.Hashtags != null)
        {
            topics.AddRange(post.Hashtags);
        }

        if (post.Mentions != null)
        {
            topics.AddRange(
                post.Mentions
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Select(x => x.Trim().ToLower())
            );
        }

        if (post.ML?.Topics != null)
        {
            topics.AddRange(post.ML.Topics);
        }

        if (!string.IsNullOrWhiteSpace(post.Caption))
        {
            var words = Regex
                .Matches(post.Caption.ToLower(), @"\b[a-zA-ZÀ-ÿ0-9_]{4,}\b")
                .Select(match => match.Value)
                .Where(word =>
                    !StopWords.Contains(word) &&
                    word.Length >= 4)
                .Distinct()
                .Take(20)
                .ToList();

            topics.AddRange(words);
        }

        return topics
            .Where(topic => !string.IsNullOrWhiteSpace(topic))
            .Select(topic => topic.Trim().ToLower())
            .Distinct()
            .ToList();
    }

    public double CalculateScore(Dump.Domain.Entities.Post post)
    {
        EnsureMlData(post);

        return
            (post.Likes.Count * 1.2)
            + (post.Comments.Count * 2.0)
            + (post.Saves.Count * 4.0)
            + (post.ML.UserInteractionScore.Shares * 6.0)
            + (post.ML.UserInteractionScore.WatchTime * 0.2)
            + (post.ML.EngagementScore * 5);
    }

    private double CalculateVelocity(Dump.Domain.Entities.Post post)
    {
        var createdAt = post.CreatedAt ?? DateTime.UtcNow;

        var minutes = Math.Max(
            1,
            (DateTime.UtcNow - createdAt).TotalMinutes
        );

        var engagement =
            post.Likes.Count +
            post.Comments.Count +
            post.Saves.Count;

        return engagement / minutes;
    }

    private string NormalizeTopic(string value)
    {
        return value
            .Trim()
            .ToLower()
            .Replace("#", "")
            .Replace("@", "")
            .Replace(" ", "-");
    }

    private void EnsureMlData(Dump.Domain.Entities.Post post)
    {
        if (post.ML == null)
        {
            post.ML = new PostML();
        }

        post.ML.Topics ??= new List<string>();

        post.ML.Language ??= "pt";

        post.ML.UserInteractionScore ??= new UserInteractionScore();

        post.ML.ContentFeatures ??= new ContentFeatures();
    }

    private static readonly List<string> StopWords =
    new List<string>
    {
        "para",
        "com",
        "isso",
        "essa",
        "esse",
        "hoje",
        "sobre",
        "porque",
        "muito",
        "mais",
        "menos",
        "onde",
        "quando",
        "como",
        "ainda",
        "tambem",
        "the",
        "with",
        "that",
        "this",
        "from"
    };
}
