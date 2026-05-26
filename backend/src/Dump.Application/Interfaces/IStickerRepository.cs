using Dump.Domain.Entities;

namespace Dump.Application.Interfaces;

public interface IStickerRepository
{
    Task<List<Sticker>> GetCustomStickersAsync(string userId, CancellationToken cancellationToken = default);
    Task<Sticker?> GetByIdAsync(string stickerId, CancellationToken cancellationToken = default);
    Task<Sticker> CreateCustomStickerAsync(Sticker sticker, CancellationToken cancellationToken = default);
    Task DeleteCustomStickerAsync(string userId, string stickerId, CancellationToken cancellationToken = default);

    Task<List<StickerSnapshot>> GetRecentStickersAsync(string userId, CancellationToken cancellationToken = default);
    Task<List<StickerSnapshot>> UpsertRecentStickerAsync(string userId, StickerSnapshot sticker, CancellationToken cancellationToken = default);

    Task<List<string>> GetFavoriteStickerIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<List<string>> ToggleFavoriteStickerAsync(string userId, string stickerId, CancellationToken cancellationToken = default);
}