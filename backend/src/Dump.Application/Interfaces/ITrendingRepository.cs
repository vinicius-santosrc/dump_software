using Dump.Domain.Entities;

namespace Dump.Application.Interfaces;

public interface ITrendingRepository
{
    Task<TrendingTopic?> GetBySlugAsync(string slug);

    Task<List<TrendingTopic>> GetTrendingAsync(int limit = 20);

    Task CreateAsync(TrendingTopic topic);

    Task UpdateAsync(TrendingTopic topic);
}