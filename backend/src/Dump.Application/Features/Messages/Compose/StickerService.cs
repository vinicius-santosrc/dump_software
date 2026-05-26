using Dump.Domain.Entities;
using Dump.Application.Interfaces;

namespace Dump.Application.Features.Messages.Compose;

public class StickerService
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif"
    };

    private const long MaxStickerSizeInBytes = 512 * 1024;

    private readonly IStickerRepository _stickerRepository;

    public StickerService(IStickerRepository stickerRepository)
    {
        _stickerRepository = stickerRepository;
    }

    public async Task<List<StickerResponse>> GetCustomStickersAsync(string userId, CancellationToken cancellationToken = default)
    {
        var stickers = await _stickerRepository.GetCustomStickersAsync(userId, cancellationToken);

        return stickers.Select(ToResponse).ToList();
    }

    public async Task<StickerResponse> CreateCustomStickerAsync(string userId, CreateCustomStickerRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);
        ValidateStickerRequest(request);

        var sticker = new Sticker
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Name = string.IsNullOrWhiteSpace(request.Name)
                ? Path.GetFileNameWithoutExtension(request.FileName)
                : request.Name.Trim(),
            Url = $"data:{request.ContentType};base64,{Convert.ToBase64String(request.Content)}",
            PackId = "custom",
            PackName = "Meus stickers",
            IsCustom = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdSticker = await _stickerRepository.CreateCustomStickerAsync(sticker, cancellationToken);

        return ToResponse(createdSticker);
    }

    public async Task DeleteCustomStickerAsync(string userId, string stickerId, CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (string.IsNullOrWhiteSpace(stickerId))
        {
            throw new ArgumentException("Sticker inválido.", nameof(stickerId));
        }

        await _stickerRepository.DeleteCustomStickerAsync(userId, stickerId, cancellationToken);
    }

    public async Task<List<StickerResponse>> GetRecentStickersAsync(string userId, CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        var stickers = await _stickerRepository.GetRecentStickersAsync(userId, cancellationToken);

        return stickers.Select(ToResponse).ToList();
    }

    public async Task<List<StickerResponse>> AddRecentStickerAsync(string userId, AddRecentStickerRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (request.Sticker is null && string.IsNullOrWhiteSpace(request.StickerId))
        {
            throw new ArgumentException("Sticker inválido.");
        }

        var stickerSnapshot = request.Sticker is not null
            ? ToSnapshot(request.Sticker)
            : await BuildSnapshotFromStickerIdAsync(request.StickerId!, cancellationToken);

        var recentStickers = await _stickerRepository.UpsertRecentStickerAsync(userId, stickerSnapshot, cancellationToken);

        return recentStickers.Select(ToResponse).ToList();
    }

    public async Task<List<string>> GetFavoriteStickerIdsAsync(string userId, CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        return await _stickerRepository.GetFavoriteStickerIdsAsync(userId, cancellationToken);
    }

    public async Task<List<string>> ToggleFavoriteStickerAsync(string userId, ToggleFavoriteStickerRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (string.IsNullOrWhiteSpace(request.StickerId))
        {
            throw new ArgumentException("Sticker inválido.", nameof(request.StickerId));
        }

        return await _stickerRepository.ToggleFavoriteStickerAsync(userId, request.StickerId, cancellationToken);
    }

    private async Task<StickerSnapshot> BuildSnapshotFromStickerIdAsync(string stickerId, CancellationToken cancellationToken)
    {
        var sticker = await _stickerRepository.GetByIdAsync(stickerId, cancellationToken);

        if (sticker is null)
        {
            return new StickerSnapshot
            {
                Id = stickerId,
                Name = stickerId,
                Url = string.Empty,
                PackId = "unknown",
                PackName = "Stickers",
                IsCustom = false,
                CreatedAt = DateTime.UtcNow
            };
        }

        return ToSnapshot(ToResponse(sticker));
    }

    private static void ValidateStickerRequest(CreateCustomStickerRequest request)
    {
        if (request.Content.Length == 0)
        {
            throw new ArgumentException("Arquivo de sticker inválido.", nameof(request));
        }

        if (!AllowedContentTypes.Contains(request.ContentType))
        {
            throw new ArgumentException("Formato de sticker não suportado.", nameof(request));
        }

        if (request.Content.Length > MaxStickerSizeInBytes)
        {
            throw new ArgumentException("Sticker muito grande. Envie um sticker menor.", nameof(request));
        }
    }

    private static void ValidateUserId(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("Usuário inválido.", nameof(userId));
        }
    }

    private static StickerResponse ToResponse(Sticker sticker)
    {
        return new StickerResponse
        {
            Id = sticker.Id,
            Name = sticker.Name,
            Url = sticker.Url,
            PackId = sticker.PackId,
            PackName = sticker.PackName,
            IsCustom = sticker.IsCustom,
            CreatedAt = sticker.CreatedAt
        };
    }

    private static StickerResponse ToResponse(StickerSnapshot sticker)
    {
        return new StickerResponse
        {
            Id = sticker.Id,
            Name = sticker.Name,
            Url = sticker.Url,
            PackId = sticker.PackId,
            PackName = sticker.PackName,
            IsCustom = sticker.IsCustom,
            CreatedAt = sticker.CreatedAt
        };
    }

    private static StickerSnapshot ToSnapshot(StickerResponse sticker)
    {
        return new StickerSnapshot
        {
            Id = sticker.Id,
            Name = sticker.Name,
            Url = sticker.Url,
            PackId = sticker.PackId ?? "custom",
            PackName = sticker.PackName ?? "Meus stickers",
            IsCustom = sticker.IsCustom,
            CreatedAt = sticker.CreatedAt ?? DateTime.UtcNow
        };
    }
}

public class CreateCustomStickerRequest
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string? Name { get; set; }
}

public class StickerResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? PackId { get; set; }
    public string? PackName { get; set; }
    public bool IsCustom { get; set; }
    public bool IsFavorite { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class AddRecentStickerRequest
{
    public string? StickerId { get; set; }
    public StickerResponse? Sticker { get; set; }
}

public class ToggleFavoriteStickerRequest
{
    public string StickerId { get; set; } = string.Empty;
}
