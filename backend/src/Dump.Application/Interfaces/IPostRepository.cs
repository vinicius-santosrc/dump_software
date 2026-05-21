using Dump.Domain.Entities;

namespace Dump.Application.Interfaces;

public interface IPostsRepository
{
    Task<Post[]> GetByUser(
        string id,
        DateTime? cursor = null,
        int limit = 10
    );
    Task<List<Post>> GetByUserProfile(string userId);
    Task<Post> GetById(string postId);
    Task<Post> UpdatePost(Post post);
    Task CreateAsync(Post post);
    Task<Post[]> GetDumpsByUserProfile(string id);
    Task ArchiveAsync(string postId);
    Task UnarchiveAsync(string postId);
    Task SoftDeleteAsync(string postId);
    Task RestoreAsync(string postId);
    Task<List<Post>> GetArchivedAsync(string userId);
    Task<List<Post>> GetArchivedByUser(string userId);
}