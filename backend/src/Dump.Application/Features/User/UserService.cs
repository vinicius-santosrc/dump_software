using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using System.Linq;

namespace Dump.Application.Features.User;

public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(
        IUserRepository userRepository
    )
    {
        _userRepository = userRepository;
    }

    public async Task<Dump.Domain.Entities.User> GetById(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user;
    }

    public async Task<Dump.Domain.Entities.User[]> GetRelatedByCurrentUser(string id)
    {
        var user = await _userRepository.GetRelatedByCurrentUser(id);
        return user;
    }

    public async Task<Dump.Domain.Entities.User> GetByUsername(string username)
    {
        var user = await _userRepository.GetByUsernameAsync(username);
        return user;
    }

    public async Task FollowUser(string currentUserId, string targetId)
    {
        var currentUser = await _userRepository.GetByIdAsync(currentUserId);
        var targetUser = await _userRepository.GetByIdAsync(targetId);

        if (currentUser == null || targetUser == null)
            throw new Exception("User not found");

        currentUser.Following ??= Array.Empty<string>();
        targetUser.Followers ??= Array.Empty<string>();

        if (!currentUser.Following.Contains(targetId))
        {
            currentUser.Following = currentUser.Following.Append(targetId).ToArray();
            targetUser.Followers = targetUser.Followers.Append(currentUserId).ToArray();
        }
        else
        {
            currentUser.Following = currentUser.Following.Where(id => id != targetId).ToArray();
            targetUser.Followers = targetUser.Followers.Where(id => id != currentUserId).ToArray();
        }

        await _userRepository.UpdateUsers(currentUser, targetUser);
    }
}