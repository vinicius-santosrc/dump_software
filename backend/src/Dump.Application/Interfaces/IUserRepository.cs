using Dump.Domain.Entities;
using System.Threading.Tasks;

namespace Dump.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByPhoneNumberAsync(string phoneNumber);
    Task<User[]> GetRelatedByCurrentUser(string id);
    Task<User[]> GetByIdsAsync(string[] ids);
    Task<User[]> GetRandomUsersAsync(int limit);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(string id);
    Task CreateAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(string id);
    Task UpdateUsers(User currentUser, User targetUser);
}