using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using Dump.Infrastructure.Persistence.Mongo;
using MongoDB.Driver;

namespace Dump.Infrastructure.Repositories;

public class MediaAssetRepository : IMediaAssetRepository
{
    private readonly IMongoCollection<MediaAsset> _collection;

    public MediaAssetRepository(MongoContext context)
    {
        _collection = context.GetCollection<MediaAsset>("media_assets");
    }

    public async Task<MediaAsset> CreateAsync(MediaAsset mediaAsset, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(mediaAsset, cancellationToken: cancellationToken);
        return mediaAsset;
    }

    public async Task<MediaAsset?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(media => media.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }
}