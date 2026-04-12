using Dump.Domain.Entities;

namespace Dump.Application.Interfaces;

public interface IPostsRepository
{
    Task<Post[]> GetByUser(string id);
    Task<Post[]> GetByUserProfile(string id);
    Task<Post> GetById(string postId);
    Task<Post> UpdatePost(Post post);
    Task CreateAsync(Post post);
}