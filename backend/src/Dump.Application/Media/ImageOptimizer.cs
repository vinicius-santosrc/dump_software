using Dump.Application.DTOs.Uploads;
using Dump.Application.Interfaces;

namespace Dump.Application.Media;

public class ImageOptimizer : IImageOptimizer
{
    public Task<UploadMediaFileDto> OptimizeAsync(
        UploadMediaFileDto file,
        CancellationToken cancellationToken = default
    )
    {
        // Otimização real será implementada depois.
        return Task.FromResult(file);
    }
}