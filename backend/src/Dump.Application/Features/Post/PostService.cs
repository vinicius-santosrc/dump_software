using Dump.Application.Interfaces;
using System.Linq;

namespace Dump.Application.Features.Post;

public class PostService
{
    private readonly IPostsRepository _postRepository;
    private readonly IUserRepository _userRepository;

    public PostService(
        IPostsRepository postRepository,
        IUserRepository userRepository
    )
    {
        _postRepository = postRepository;
        _userRepository = userRepository;
    }

    private async Task<Dump.Domain.Entities.PostResponse> MapToResponse(Dump.Domain.Entities.Post post)
    {
        var user = await _userRepository.GetByIdAsync(post.User);

        if (user == null)
            throw new Exception("User not found");

        return new Dump.Domain.Entities.PostResponse
        {
            Id = post.Id,
            Caption = post.Caption,
            Media = post.Media,
            Location = post.Location,
            Hashtags = post.Hashtags,
            Mentions = post.Mentions,
            Likes = post.Likes ?? new List<string>(),
            Saves = post.Saves ?? new List<string>(),
            Reports = post.Reports ?? new List<string>(),
            Comments = post.Comments ?? new List<string>(),
            Visibility = post.Visibility,
            ML = post.ML,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            User = user
        };
    }

    public async Task<Dump.Domain.Entities.Post> CreatePost(Dump.Domain.Entities.Post post)
    {
        await _postRepository.CreateAsync(post);
        return post;
    }

    public async Task<Dump.Domain.Entities.PostResponse[]> GetByUser(string id)
    {
        var posts = await _postRepository.GetByUser(id);

        var responses = await Task.WhenAll(posts.Select(MapToResponse));

        return responses
            .OrderByDescending(r => r.CreatedAt)
            .ToArray();
    }

    public async Task<Dump.Domain.Entities.PostResponse[]> GetByUserProfile(string id)
    {
        var posts = await _postRepository.GetByUserProfile(id);

        var responses = await Task.WhenAll(posts.Select(MapToResponse));

        return responses
            .OrderByDescending(r => r.CreatedAt)
            .ToArray();
    }


    public async Task<Dump.Domain.Entities.PostResponse> GetById(string postId)
    {
        var post = await _postRepository.GetById(postId);

        if (post == null)
            throw new Exception("Post not found");

        return await MapToResponse(post);
    }

    public async Task<bool> HandleLike(string postId, string likerId)
    {
        var post = await _postRepository.GetById(postId);
        
        post.Likes ??= new List<string>();

        var alreadyLiked = post.Likes.Any(l => l.Trim().Equals(likerId.Trim(), StringComparison.OrdinalIgnoreCase));

        if (alreadyLiked)
        {
            post.Likes = post.Likes
                .Where(l => !l.Trim().Equals(likerId.Trim(), StringComparison.OrdinalIgnoreCase))
                .ToList();

            await _postRepository.UpdatePost(post);
            return false; // removeu like
        }

        post.Likes.Add(likerId);

        await _postRepository.UpdatePost(post);
        return true; // adicionou like
    }
}