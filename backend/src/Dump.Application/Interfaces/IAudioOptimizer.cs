using Dump.Application.DTOs.Uploads;

namespace Dump.Application.Interfaces;

public interface IAudioOptimizer
{
    Task<UploadMediaFileDto> OptimizeAsync(
        UploadMediaFileDto file,
        CancellationToken cancellationToken = default
    );
}