using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Driver;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class MemoriesRepository : IMemoriesRepository
{
    private readonly IMongoCollection<Memorie> _col;

    public MemoriesRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("dump_dev");
        _col = database.GetCollection<Memorie>("moments");
    }

    public async Task<Memorie?> GetById(string id)
    {
        var now = DateTime.UtcNow;
        return await _col.Find(m => m.Id == id && m.AvailableUntil > now).FirstOrDefaultAsync();
    }

    public async Task<List<Memorie>> GetActiveByUserId(string userId)
    {
        var now = DateTime.UtcNow;

        return await _col
            .Find(m => m.UserId == userId && m.AvailableUntil > now)
            .SortBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Memorie>> GetActiveByUserIds(List<string> userIds)
    {
        var now = DateTime.UtcNow;

        return await _col
            .Find(m => userIds.Contains(m.UserId) && m.AvailableUntil > now)
            .SortByDescending(m => m.CreatedAt)
            .ToListAsync();
    }
}