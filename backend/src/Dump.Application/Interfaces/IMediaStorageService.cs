namespace Dump.Application.Interfaces;

public interface IMediaStorageService
{
    Task<object> UploadAsync(
        object file,
        string ownerUserId,
        CancellationToken cancellationToken = default
    );
}