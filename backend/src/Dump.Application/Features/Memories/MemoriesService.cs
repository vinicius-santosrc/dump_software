using Dump.Application.Interfaces;
using Dump.Domain.Entities;

namespace Dump.Application.Features.Messages;

public class MemoriesService
{
    private readonly IMemoriesRepository _repository;
    private readonly IUserRepository _userRepository;

    public MemoriesService(IMemoriesRepository repository, IUserRepository userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<Memorie> GetById(string id)
    {
        var memorie = await _repository.GetById(id)
            ?? throw new Exception("Story not found.");

        var user = await _userRepository.GetByIdAsync(memorie.UserId);
        memorie.User = user;

        return memorie;
    }

    public async Task<List<Memorie>> GetStoryByUser(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new Exception("User not found.");

        var stories = await _repository.GetActiveByUserId(userId);

        foreach (var story in stories)
        {
            story.User = new Domain.Entities.User
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Verified = user.Verified,
                Thumbnail = user.Thumbnail
            };
        }

        return stories
            .OrderBy(story => story.CreatedAt)
            .ToList();
    }

    public async Task<List<Memorie>> GetStoryByUsername(string username)
    {
        var user = await _userRepository.GetByUsernameAsync(username)
            ?? throw new Exception("User not found.");

        var stories = await _repository.GetActiveByUserId(user.Id);

        foreach (var story in stories)
        {
            story.User = new Domain.Entities.User
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Verified = user.Verified,
                ProfilePictureUrl = user.ProfilePictureUrl
            };
        }

        return stories
            .OrderBy(story => story.CreatedAt)
            .ToList();
    }

    public async Task<List<StoryGroup>> GetAllByUser(string currentUserId)
    {
        var currentUser = await _userRepository.GetByIdAsync(currentUserId)
            ?? throw new Exception("User not found.");

        var userIdsToLoad = new List<string> { currentUserId };

        if (currentUser.Following is not null && currentUser.Following.Length > 0)
        {
            userIdsToLoad.AddRange(currentUser.Following);
        }

        var activeStories = await _repository.GetActiveByUserIds(userIdsToLoad.Distinct().ToList());

        if (!activeStories.Any())
        {
            return new List<StoryGroup>();
        }

        var distinctUserIds = activeStories
            .Select(story => story.UserId)
            .Distinct()
            .ToList();

        var users = await Task.WhenAll(distinctUserIds.Select(id => _userRepository.GetByIdAsync(id)));
        var usersMap = users
            .Where(user => user is not null)
            .ToDictionary(user => user!.Id, user => user!);

        foreach (var story in activeStories)
        {
            if (usersMap.TryGetValue(story.UserId, out var user))
            {
                story.User = new Domain.Entities.User
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    Verified = user.Verified,
                    ProfilePictureUrl = user.ProfilePictureUrl
                };
            }
        }

        foreach (var story in activeStories)
        {
            if (!string.IsNullOrWhiteSpace(story.PhotoUrl) &&
                story.PhotoUrl.Length > 500)
            {
                story.PhotoUrl = string.Empty;
            }
        }

        var groupedStories = activeStories
            .GroupBy(story => story.UserId)
            .Select(group =>
            {
                usersMap.TryGetValue(group.Key, out var user);

                var orderedStories = group
                    .OrderBy(story => story.CreatedAt)
                    .ToList();

                return new StoryGroup
                {
                    User = user,
                    Stories = orderedStories,
                    LastStoryAt = orderedStories.Max(story => story.CreatedAt)
                };
            })
            .OrderByDescending(group => group.User?.Id == currentUserId)
            .ThenByDescending(group => group.LastStoryAt)
            .ToList();

        return groupedStories;
    }
}