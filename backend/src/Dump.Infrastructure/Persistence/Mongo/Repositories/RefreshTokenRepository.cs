using MongoDB.Driver;
using Dump.Domain.Entities;
using Dump.Application.Interfaces;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly IMongoCollection<RefreshToken> _refreshTokens;

    public RefreshTokenRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("dump_dev");
        _refreshTokens = database.GetCollection<RefreshToken>("refresh_tokens");
    }

    public async Task CreateAsync(RefreshToken token)
    {
        await _refreshTokens.InsertOneAsync(token);
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _refreshTokens
            .Find(t => t.Token == token)
            .FirstOrDefaultAsync();
    }

    public async Task RevokeAsync(string token)
    {
        var update = Builders<RefreshToken>.Update
            .Set(t => t.IsRevoked, true);

        await _refreshTokens.UpdateOneAsync(
            t => t.Token == token,
            update
        );
    }

    public async Task UpdateAsync(RefreshToken token)
    {
        await _refreshTokens.ReplaceOneAsync(
            t => t.Token == token.Token,
            token
        );
    }
}