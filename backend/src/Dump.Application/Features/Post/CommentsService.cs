using Dump.Application.Interfaces;
using System.Linq;

namespace Dump.Application.Features.Post;

public class CommentsService
{
    private readonly ICommentsRepository _commentsRepository;
    private readonly IUserRepository _userRepository;

    public CommentsService(
        ICommentsRepository commentsRepository,
        IUserRepository userRepository
    )
    {
        _commentsRepository = commentsRepository;
        _userRepository = userRepository;
    }

    public async Task<Dump.Domain.Entities.Comment[]> GetByPostId(string postId)
    {
        var comments = (await _commentsRepository.GetByPostIdAsync(postId)).ToList();

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
}