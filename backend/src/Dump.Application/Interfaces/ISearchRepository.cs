public interface ISearchRepository
{
    Task<List<UserDto>> SearchUsersAsync(string query);
    Task<List<PostDto>> SearchPostsAsync(string query);
}