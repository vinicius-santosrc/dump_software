using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Driver;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class StickerRepository : IStickerRepository
{
    private const int MaxRecentStickers = 24;

    private readonly IMongoCollection<Sticker> _stickers;
    private readonly IMongoCollection<UserRecentSticker> _recentStickers;
    private readonly IMongoCollection<UserFavoriteSticker> _favoriteStickers;

    public StickerRepository(IMongoDatabase database)
    {
        _stickers = database.GetCollection<Sticker>("stickers");
        _recentStickers = database.GetCollection<UserRecentSticker>("user_recent_stickers");
        _favoriteStickers = database.GetCollection<UserFavoriteSticker>("user_favorite_stickers");
    }

    public async Task<List<Sticker>> GetCustomStickersAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _stickers
            .Find(sticker => sticker.UserId == userId && sticker.IsCustom)
            .SortByDescending(sticker => sticker.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Sticker?> GetByIdAsync(string stickerId, CancellationToken cancellationToken = default)
    {
        return await _stickers
            .Find(sticker => sticker.Id == stickerId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Sticker> CreateCustomStickerAsync(Sticker sticker, CancellationToken cancellationToken = default)
    {
        sticker.Id = string.IsNullOrWhiteSpace(sticker.Id) ? Guid.NewGuid().ToString() : sticker.Id;
        sticker.CreatedAt = DateTime.UtcNow;
        sticker.UpdatedAt = DateTime.UtcNow;

        await _stickers.InsertOneAsync(sticker, cancellationToken: cancellationToken);

        return sticker;
    }

    public async Task DeleteCustomStickerAsync(string userId, string stickerId, CancellationToken cancellationToken = default)
    {
        await _stickers.DeleteOneAsync(
            sticker => sticker.Id == stickerId && sticker.UserId == userId && sticker.IsCustom,
            cancellationToken
        );

        await _recentStickers.DeleteManyAsync(
            recent => recent.UserId == userId && recent.StickerId == stickerId,
            cancellationToken
        );

        await _favoriteStickers.DeleteManyAsync(
            favorite => favorite.UserId == userId && favorite.StickerId == stickerId,
            cancellationToken
        );
    }

    public async Task<List<StickerSnapshot>> GetRecentStickersAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _recentStickers
            .Find(recent => recent.UserId == userId)
            .SortByDescending(recent => recent.UpdatedAt)
            .Limit(MaxRecentStickers)
            .Project(recent => recent.Sticker)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<StickerSnapshot>> UpsertRecentStickerAsync(string userId, StickerSnapshot sticker, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var filter = Builders<UserRecentSticker>.Filter.And(
            Builders<UserRecentSticker>.Filter.Eq(recent => recent.UserId, userId),
            Builders<UserRecentSticker>.Filter.Eq(recent => recent.StickerId, sticker.Id)
        );

        var update = Builders<UserRecentSticker>.Update
            .Set(recent => recent.Sticker, sticker)
            .Set(recent => recent.UpdatedAt, now)
            .SetOnInsert(recent => recent.Id, Guid.NewGuid().ToString())
            .SetOnInsert(recent => recent.UserId, userId)
            .SetOnInsert(recent => recent.StickerId, sticker.Id)
            .SetOnInsert(recent => recent.CreatedAt, now);

        await _recentStickers.UpdateOneAsync(
            filter,
            update,
            new UpdateOptions { IsUpsert = true },
            cancellationToken
        );

        var recentIdsToKeep = await _recentStickers
            .Find(recent => recent.UserId == userId)
            .SortByDescending(recent => recent.UpdatedAt)
            .Limit(MaxRecentStickers)
            .Project(recent => recent.Id)
            .ToListAsync(cancellationToken);

        await _recentStickers.DeleteManyAsync(
            recent => recent.UserId == userId && !recentIdsToKeep.Contains(recent.Id),
            cancellationToken
        );

        return await GetRecentStickersAsync(userId, cancellationToken);
    }

    public async Task<List<string>> GetFavoriteStickerIdsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _favoriteStickers
            .Find(favorite => favorite.UserId == userId)
            .SortByDescending(favorite => favorite.CreatedAt)
            .Project(favorite => favorite.StickerId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<string>> ToggleFavoriteStickerAsync(string userId, string stickerId, CancellationToken cancellationToken = default)
    {
        var existingFavorite = await _favoriteStickers
            .Find(favorite => favorite.UserId == userId && favorite.StickerId == stickerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingFavorite is not null)
        {
            await _favoriteStickers.DeleteOneAsync(
                favorite => favorite.Id == existingFavorite.Id,
                cancellationToken
            );

            return await GetFavoriteStickerIdsAsync(userId, cancellationToken);
        }

        var favoriteSticker = new UserFavoriteSticker
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            StickerId = stickerId,
            CreatedAt = DateTime.UtcNow
        };

        await _favoriteStickers.InsertOneAsync(favoriteSticker, cancellationToken: cancellationToken);

        return await GetFavoriteStickerIdsAsync(userId, cancellationToken);
    }
}
