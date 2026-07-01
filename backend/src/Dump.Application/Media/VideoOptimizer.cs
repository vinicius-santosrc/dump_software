using Dump.Application.DTOs.Uploads;
using Dump.Application.Interfaces;

namespace Dump.Application.Media;

public class VideoOptimizer : IVideoOptimizer
{
    public Task<UploadMediaFileDto> OptimizeAsync(
        UploadMediaFileDto file,
        CancellationToken cancellationToken = default
    )
    {
        // TODO:
        // - Redimensionar vídeo
        // - Ajustar bitrate
        // - Converter codec (H.264/H.265/AV1)
        // - Otimizar áudio interno
        // - Gerar thumbnail
        // - Extrair duração
        // - Extrair resolução

        return Task.FromResult(file);
    }
}