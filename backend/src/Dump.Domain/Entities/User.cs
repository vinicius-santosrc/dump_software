using MongoDB.Bson.Serialization.Attributes;

namespace Dump.Domain.Entities;
public class User
{
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("username")]
    public string Username { get; set; } = string.Empty;

    [BsonElement("fullName")]
    public string FullName { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("email_verified")]
    public bool Email_Verified { get; set; } = false;

    [BsonElement("phoneNumber")]
    public string PhoneNumber { get; set; } = string.Empty;

    [BsonElement("password")]
    public string Password { get; set; } = string.Empty;

    [BsonElement("verified")]
    public bool Verified { get; set; } = false;

    [BsonElement("bio")]
    public string Bio { get; set; } = string.Empty;

    [BsonElement("profilePictureUrl")]
    public string ProfilePictureUrl { get; set; } = string.Empty;

    [BsonElement("birthDate")]
    public DateTime BirthDate { get; set; } = DateTime.Now;

    [BsonElement("website")]
    public string Website { get; set; } = string.Empty;

    [BsonElement("followers")]
    public string[] Followers { get; set; } = [];

    [BsonElement("following")]
    public string[] Following { get; set; } = [];

    [BsonElement("posts")]
    public string[] Posts { get; set; } = [];

    [BsonElement("moments")]
    public string[] Moments { get; set; } = [];

    [BsonElement("isPrivate")]
    public bool IsPrivate { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}