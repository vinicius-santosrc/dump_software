using Dump.Application.DTOs.Uploads;

namespace Dump.Application.Interfaces;

public interface IImageOptimizer
{
    Task<UploadMediaFileDto> OptimizeAsync(
        UploadMediaFileDto file,
        CancellationToken cancellationToken = default
    );
}