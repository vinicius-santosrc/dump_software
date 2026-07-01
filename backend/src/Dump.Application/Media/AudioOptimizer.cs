using Dump.Application.DTOs.Uploads;
using Dump.Application.Interfaces;

namespace Dump.Application.Media;

public class AudioOptimizer : IAudioOptimizer
{
    public Task<UploadMediaFileDto> OptimizeAsync(
        UploadMediaFileDto file,
        CancellationToken cancellationToken = default
    )
    {
        // TODO:
        // - Converter para AAC/Opus
        // - Ajustar bitrate
        // - Ajustar sample rate
        // - Normalizar volume
        // - Remover metadados
        // - Gerar waveform (opcional)

        return Task.FromResult(file);
    }
}