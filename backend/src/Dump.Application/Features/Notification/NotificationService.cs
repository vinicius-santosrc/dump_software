using Dump.Application.Interfaces;
namespace Dump.Application.Features.Messages;

using Dump.Application.DTOs;
using Dump.Application.Features.User;
using Dump.Domain.Entities;
public class NotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateLikeNotification(string userId, string fromUserId, string postId)
    {
        if (userId == fromUserId) return;

        var notification = new Notification
        {
            UserId = userId,
            FromUserId = fromUserId,
            Type = "like",
            PostId = postId
        };

        await _repository.InsertAsync(notification);
    }

    public async Task CreateCommentNotification(string userId, string fromUserId, string postId, string commentId)
    {
        if (userId == fromUserId) return;

        var notification = new Notification
        {
            UserId = userId,
            FromUserId = fromUserId,
            Type = "comment",
            PostId = postId,
            CommentId = commentId
        };

        await _repository.InsertAsync(notification);
    }
}