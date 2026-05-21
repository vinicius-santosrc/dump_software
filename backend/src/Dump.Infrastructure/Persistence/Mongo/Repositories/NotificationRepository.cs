using System.Linq;
using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly IMongoCollection<Notification> _notifications;
    private readonly IMongoCollection<User> _users;

    public NotificationRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("dump_dev");

        _notifications = database.GetCollection<Notification>("notifications");
        _users = database.GetCollection<User>("users");
    }

    public async Task InsertAsync(Notification notification)
    {
        await _notifications.InsertOneAsync(notification);
    }

    public async Task<List<NotificationResponse>> GetByUserIdAsync(string userId)
    {
        var notifications = await _notifications
            .Find(Builders<Notification>.Filter.Eq("userId", userId))
            .Sort(Builders<Notification>.Sort.Descending("createdAt"))
            .ToListAsync();

        if (!notifications.Any())
            return new List<NotificationResponse>();

        var fromUserIds = notifications
            .Select(n => n.FromUserId)
            .Distinct()
            .ToArray();

        var users = await _users
            .Find(u => fromUserIds.Contains(u.Id))
            .ToListAsync();

        var userDict = users.ToDictionary(u => u.Id, u => u);

        var response = notifications.Select(n => new NotificationResponse
        {
            Id = n.Id,
            User = userDict.ContainsKey(n.UserId) ? userDict[n.UserId] : null,
            FromUser= userDict.ContainsKey(n.FromUserId) ? userDict[n.FromUserId] : null,
            Type = n.Type,
            PostId = n.PostId,
            CommentId = n.CommentId,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();

        return response;
    }

    public async Task MarkAsReadAsync(string notificationId)
    {
        await _notifications.UpdateOneAsync(
            n => n.Id == notificationId,
            Builders<Notification>.Update.Set(n => n.IsRead, true)
        );
    }
}