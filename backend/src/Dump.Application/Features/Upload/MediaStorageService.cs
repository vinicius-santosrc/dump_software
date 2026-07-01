using Dump.Application.DTOs.Uploads;
using Dump.Application.Interfaces;
using Dump.Application.Media;
using Dump.Domain.Entities;

namespace Dump.Application.Services;

public class MediaStorageService : IMediaStorageService
{
    private const long MaxImageBytes = 8 * 1024 * 1024;
    private const long MaxAudioBytes = 10 * 1024 * 1024;
    private const long MaxVideoBytes = 100 * 1024 * 1024;

    private readonly IMediaAssetRepository _mediaAssetRepository;
    private readonly IImageOptimizer _imageOptimizer;
    private readonly IAudioOptimizer _audioOptimizer;
    private readonly IVideoOptimizer _videoOptimizer;

    public MediaStorageService(
        IMediaAssetRepository mediaAssetRepository,
        IImageOptimizer imageOptimizer,
        IAudioOptimizer audioOptimizer,
        IVideoOptimizer videoOptimizer)
    {
        _mediaAssetRepository = mediaAssetRepository;
        _imageOptimizer = imageOptimizer;
        _audioOptimizer = audioOptimizer;
        _videoOptimizer = videoOptimizer;
    }

    public async Task<object> UploadAsync(
        object input,
        string ownerUserId,
        CancellationToken cancellationToken = default)
    {
        var file = (UploadMediaFileDto)input;

        ValidateFile(file);

        var mediaType = ResolveMediaType(file.ContentType);
        var optimizedFile = await OptimizeAsync(file, mediaType, cancellationToken);

        var extension = ResolveExtension(optimizedFile.FileName, optimizedFile.ContentType, mediaType);
        var fileName = StoragePathGenerator.GenerateFileName(extension);
        var relativePath = StoragePathGenerator.GenerateRelativePath(mediaType, fileName);

        var storageRoot = Path.Combine(Directory.GetCurrentDirectory(), "storage");
        var absolutePath = Path.Combine(storageRoot, relativePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

        Directory.CreateDirectory(Path.GetDirectoryName(absolutePath)!);

        await using (var output = new FileStream(absolutePath, FileMode.CreateNew))
        {
            optimizedFile.Content.Position = 0;
            await optimizedFile.Content.CopyToAsync(output, cancellationToken);
        }

        var publicBaseUrl = Environment.GetEnvironmentVariable("PUBLIC_CDN_URL")
            ?? "http://localhost:5207/cdn";

        var publicUrl = StoragePathGenerator.GeneratePublicUrl(publicBaseUrl, relativePath);

        var mediaAsset = new MediaAsset
        {
            OwnerUserId = ownerUserId,
            Type = mediaType,
            MimeType = optimizedFile.ContentType,
            OriginalFileName = file.FileName,
            FileName = fileName,
            RelativePath = relativePath,
            PublicUrl = publicUrl,
            SizeBytes = optimizedFile.Length,
            CreatedAt = DateTime.UtcNow
        };

        await _mediaAssetRepository.CreateAsync(mediaAsset, cancellationToken);

        return new UploadMediaResponseDto
        {
            Id = mediaAsset.Id,
            Url = mediaAsset.PublicUrl,
            Type = mediaAsset.Type,
            MimeType = mediaAsset.MimeType,
            FileName = mediaAsset.FileName,
            SizeBytes = mediaAsset.SizeBytes,
            Width = mediaAsset.Width,
            Height = mediaAsset.Height,
            DurationSeconds = mediaAsset.DurationSeconds,
            CreatedAt = mediaAsset.CreatedAt
        };
    }

    private async Task<UploadMediaFileDto> OptimizeAsync(
        UploadMediaFileDto file,
        string mediaType,
        CancellationToken cancellationToken)
    {
        return mediaType switch
        {
            "image" => await _imageOptimizer.OptimizeAsync(file, cancellationToken),
            "audio" => await _audioOptimizer.OptimizeAsync(file, cancellationToken),
            "video" => await _videoOptimizer.OptimizeAsync(file, cancellationToken),
            _ => file
        };
    }

    private static void ValidateFile(UploadMediaFileDto file)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Arquivo vazio.");
        }

        var mediaType = ResolveMediaType(file.ContentType);

        var maxSize = mediaType switch
        {
            "image" => MaxImageBytes,
            "audio" => MaxAudioBytes,
            "video" => MaxVideoBytes,
            _ => throw new InvalidOperationException("Tipo de arquivo não suportado.")
        };

        if (file.Length > maxSize)
        {
            throw new InvalidOperationException("Arquivo muito grande.");
        }
    }

    private static string ResolveMediaType(string contentType)
    {
        var type = contentType.ToLowerInvariant();

        if (type.StartsWith("image/")) return "image";
        if (type.StartsWith("audio/")) return "audio";
        if (type.StartsWith("video/")) return "video";

        throw new InvalidOperationException("Tipo de arquivo não suportado.");
    }

    private static string ResolveExtension(string fileName, string contentType, string mediaType)
    {
        var extension = Path.GetExtension(fileName)?.ToLowerInvariant();

        if (!string.IsNullOrWhiteSpace(extension))
        {
            return extension;
        }

        return contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            "audio/mpeg" => ".mp3",
            "audio/mp4" => ".m4a",
            "audio/m4a" => ".m4a",
            "audio/x-m4a" => ".m4a",
            "audio/webm" => ".webm",
            "video/mp4" => ".mp4",
            "video/webm" => ".webm",
            _ => mediaType switch
            {
                "image" => ".jpg",
                "audio" => ".m4a",
                "video" => ".mp4",
                _ => ".bin"
            }
        };
    }
}