using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Bson;
using System.Linq;

namespace Dump.Application.Features.Post;

public class PostService
{
    private readonly IPostsRepository _postRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICommentsRepository _commentsRepository;

    public PostService(
        IPostsRepository postRepository,
        IUserRepository userRepository,
        ICommentsRepository commentsRepository
    )
    {
        _postRepository = postRepository;
        _userRepository = userRepository;
        _commentsRepository = commentsRepository;
    }

    public Task ArchivePost(string postId)

        => _postRepository.ArchiveAsync(postId);

    public Task UnarchivePost(string postId)

        => _postRepository.UnarchiveAsync(postId);

    public Task DeletePost(string postId)

        => _postRepository.SoftDeleteAsync(postId);

    public Task RestorePost(string postId)

        => _postRepository.RestoreAsync(postId);

    public async Task<Dump.Domain.Entities.PostResponse[]> GetArchived(string userId)
    {
        var posts = await _postRepository.GetArchivedAsync(userId);

        var responses = await Task.WhenAll(posts.Select(MapToResponse));

        return responses
            .OrderByDescending(r => r.CreatedAt)
            .ToArray();
    }

    private async Task<Comment[]> MapComments(Comment[] comments)
    {
        // Map users
        var userIds = comments.Select(c => c.UserId).Distinct();

        var userDict = new Dictionary<string, Dump.Domain.Entities.User>();

        foreach (var userId in userIds)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                userDict[userId] = user;
            }
        }

        foreach (var comment in comments)
        {
            comment.Content = comment.IsDeleted ? "Comentário removido" : comment.Content;
            if (userDict.TryGetValue(comment.UserId, out var user))
            {
                comment.User = user;
            }
        }

        // Map responses (ids -> objects)
        var commentDict = comments.ToDictionary(c => c.Id, c => c);

        foreach (var comment in comments)
        {
            comment.Responses = comment.ResponseIds
                .Where(id => commentDict.ContainsKey(id))
                .Select(id => commentDict[id])
                .ToList();
        }

        return comments.ToArray();
    }

    private async Task<Dump.Domain.Entities.PostResponse> MapToResponse(Dump.Domain.Entities.Post post)
    {
        var user = await _userRepository.GetByIdAsync(post.User);
        var comments = await this.MapComments(await _commentsRepository.GetByPostIdAsync(post.Id));

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
            Comments = comments,
            Visibility = post.Visibility,
            ML = post.ML,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            User = user,
            IsDeleted = post.IsDeleted,
            Archived = post.Archived
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

    public async Task<Dump.Domain.Entities.PostResponse[]> GetDumpsById(string id)
    {
        var posts = await _postRepository.GetDumpsByUserProfile(id);

        var responses = await Task.WhenAll(posts.Select(MapToResponse));

        return responses
            .OrderByDescending(r => r.CreatedAt)
            .ToArray();
    }
}