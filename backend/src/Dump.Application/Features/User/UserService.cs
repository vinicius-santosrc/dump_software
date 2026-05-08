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
        var currentUser = await _userRepository.GetByIdAsync(id);
        if (currentUser == null) return [];

        var followingIds = currentUser.Following ?? [];

        // buscar todos os usuários que eu sigo de uma vez (evita N+1)
        var followingUsers = await _userRepository.GetByIdsAsync(followingIds);

        // contador de relevância
        Dictionary<string, int> score = new();

        foreach (var user in followingUsers)
        {
            if (user.Following == null) continue;

            foreach (var candidateId in user.Following)
            {
                // ignorar eu mesmo
                if (candidateId == id) continue;

                // ignorar quem eu já sigo
                if (followingIds.Contains(candidateId)) continue;

                if (!score.ContainsKey(candidateId))
                    score[candidateId] = 0;

                score[candidateId]++;
            }
        }

        // pegar top recomendados
        var topIds = score
            .OrderByDescending(x => x.Value)
            .Select(x => x.Key)
            .Take(5)
            .ToList();

        Dump.Domain.Entities.User[] usersRelated;

        if (topIds.Count == 0)
        {
            var randomUsers = await _userRepository.GetRandomUsersAsync(5);

            usersRelated = randomUsers
                .Where(u => u.Id != id && !followingIds.Contains(u.Id))
                .Take(5)
                .ToArray();
        }
        else
        {
            usersRelated = await _userRepository.GetByIdsAsync(topIds.ToArray());
        }

        return usersRelated;
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

    public async Task Update(Dump.Domain.Entities.User user)
    {
        if (user == null || string.IsNullOrEmpty(user.Id))
            throw new Exception("Invalid user data");

        var existingUser = await _userRepository.GetByIdAsync(user.Id);

        if (existingUser == null)
            throw new Exception("User not found");

        // atualizando apenas campos editáveis (safe update)
        existingUser.FullName = user.FullName ?? existingUser.FullName;
        existingUser.Username = user.Username ?? existingUser.Username;
        existingUser.Bio = user.Bio ?? existingUser.Bio;
        existingUser.ProfilePictureUrl = user.ProfilePictureUrl;
        existingUser.Thumbnail = user.Thumbnail;
        existingUser.Website = user.Website ?? existingUser.Website;
        existingUser.Gender = user.Gender ?? existingUser.Gender;

        existingUser.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(existingUser);
    }
}