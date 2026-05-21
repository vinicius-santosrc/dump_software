using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Driver;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class TrendingTopicRepository : ITrendingRepository
{
    private readonly IMongoCollection<TrendingTopic> _collection;

    public TrendingTopicRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<TrendingTopic>("trending_topics");
    }

    public async Task<TrendingTopic?> GetBySlugAsync(string slug)
    {
        return await _collection
            .Find(topic => topic.Slug == slug)
            .FirstOrDefaultAsync();
    }

    public async Task<List<TrendingTopic>> GetTrendingAsync(int limit = 20)
    {
        return await _collection
            .Find(_ => true)
            .SortByDescending(topic => topic.Score)
            .Limit(limit)
            .ToListAsync();
    }

    public async Task CreateAsync(TrendingTopic topic)
    {
        await _collection.InsertOneAsync(topic);
    }

    public async Task UpdateAsync(TrendingTopic topic)
    {
        await _collection.ReplaceOneAsync(
            x => x.Id == topic.Id,
            topic
        );
    }
}
