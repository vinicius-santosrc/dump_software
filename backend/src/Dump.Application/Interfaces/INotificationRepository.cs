using Dump.Application.DTOs;
using Dump.Domain.Entities;
public interface INotificationRepository
{
    Task InsertAsync(Notification notification);
    Task<List<NotificationResponse>> GetByUserIdAsync(string userId);
    Task MarkAsReadAsync(string notificationId);
}