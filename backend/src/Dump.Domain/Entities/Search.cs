using Dump.Domain.Entities;

public class SearchResultDto
{
    public List<UserDto> Users { get; set; }
    public List<PostDto> Posts { get; set; }
}

public class UserDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Username { get; set; }
    public string Thumbnail { get; set; } = "";
}

public class PostDto
{
    public string Id { get; set; }
    public List<PostMedia> Media { get; set; }
    public string Caption { get; set; }
}