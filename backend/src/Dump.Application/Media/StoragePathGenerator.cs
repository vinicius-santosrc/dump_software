namespace Dump.Application.Media;

public static class StoragePathGenerator
{
    public static string GenerateFileName(string extension)
    {
        return $"{Guid.NewGuid():N}{extension}";
    }

    public static string GenerateFolder(string mediaType)
    {
        return $"{DateTime.UtcNow:yyyy/MM/dd}/{mediaType}";
    }

    public static string GenerateRelativePath(string mediaType, string fileName)
    {
        return Path.Combine(
            "media",
            GenerateFolder(mediaType),
            fileName
        ).Replace("\\", "/");
    }

    public static string GeneratePublicUrl(
        string cdnBaseUrl,
        string relativePath)
    {
        return $"{cdnBaseUrl.TrimEnd('/')}/v/{relativePath}";
    }
}