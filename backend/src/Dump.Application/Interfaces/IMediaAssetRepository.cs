using Dump.Domain.Entities;

namespace Dump.Application.Interfaces;

public interface IMediaAssetRepository
{
    Task<MediaAsset> CreateAsync(MediaAsset mediaAsset, CancellationToken cancellationToken = default);

    Task<MediaAsset?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
}