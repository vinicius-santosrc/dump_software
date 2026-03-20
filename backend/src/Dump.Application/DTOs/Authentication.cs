namespace Dump.Application.DTOs;

using System.Text.Json.Serialization;

public class RegisterDto
{
    [JsonPropertyName("email_or_cellphone")]
    public string EmailOrCellphone { get; set; } = string.Empty;

    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("dateOfBirth")]
    public DateTime BirthDate { get; set; }

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    public string UserOrCellphoneOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthRegisterResponse
{
    public bool Success { get; set; } = false;
    public string Id { get; set; } = "";
}
public class AuthResponse
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public string Email { get; set; }
    public string Id { get; set; }
}