using System.Text;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Dump.Domain.Entities;
using Dump.Application.DTOs;
using Dump.Application.Interfaces;
using Dump.Application.Exceptions;
using System.Net.Http.Json;

namespace Dump.Application.Features.Auth;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ILogger<AuthService> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ILogger<AuthService> logger,
        IConfiguration configuration,
        HttpClient httpClient)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _logger = logger;
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task<AuthRegisterResponse> Register(RegisterDto dto)
    {
        var username = await GenerateUsername(dto.FullName);
        var user = new Dump.Domain.Entities.User
        {
            FullName = dto.FullName,
            BirthDate = dto.BirthDate,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Username = username,
        };

        var input = dto.EmailOrCellphone?.Trim().ToLower();

        if (!string.IsNullOrEmpty(input) && input.Contains("@"))
        {
            user.Email = input;
        }
        else if (!string.IsNullOrEmpty(input))
        {
            user.PhoneNumber = input;
        }

        try
        {
            await _userRepository.CreateAsync(user);

            return new AuthRegisterResponse
            {
                Success = true,
                Id = user.Id
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return new AuthRegisterResponse
            {
                Success = false,
                Id = ""
            };
        }
    }

    public async Task<AuthResponse> Login(LoginDto userLogin)
    {
        Dump.Domain.Entities.User? user;

        var input = userLogin.UserOrCellphoneOrEmail;

        if(input == "")
            throw new UnauthorizedException("Input de login é obrigatório");

        if (input.Contains("@"))
        {
            // email
            user = await _userRepository.GetByEmailAsync(input);
        }
        else if (input.All(char.IsDigit))
        {
            // telefone
            user = await _userRepository.GetByPhoneNumberAsync(input);
        }
        else
        {
            // username
            user = await _userRepository.GetByUsernameAsync(input);
        }

        if (user == null)
        throw new UnauthorizedException("Usuário não encontrado");

        var isValid = BCrypt.Net.BCrypt.Verify(userLogin.Password, user.Password);

        if (!isValid)
            throw new UnauthorizedException("Senha inválida");

        // 🔑 ACCESS TOKEN
        var accessToken = GenerateJwt(user);

        // 🔄 REFRESH TOKEN
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = Guid.NewGuid().ToString(),
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _refreshTokenRepository.CreateAsync(refreshToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            Email = user.Email,
            Id = user.Id
        };
    }

    public async Task ForgotPassword(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return;

        var normalizedInput = input.Trim().ToLower();
        Dump.Domain.Entities.User? user;

        if (normalizedInput.Contains("@"))
        {
            user = await _userRepository.GetByEmailAsync(normalizedInput);
        }
        else if (normalizedInput.All(char.IsDigit))
        {
            user = await _userRepository.GetByPhoneNumberAsync(normalizedInput);
        }
        else
        {
            user = await _userRepository.GetByUsernameAsync(normalizedInput);
        }

        if (user == null)
        {
            _logger.LogInformation("Forgot password requested for non existing account: {Input}", normalizedInput);
            return;
        }

        var resetToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "");

        var frontendUrl = Environment.GetEnvironmentVariable("APP_FRONTEND_URL")
            ?? _configuration["App:FrontendUrl"]
            ?? "http://localhost:4200";

        var resetUrl = $"{frontendUrl}/accounts/reset-password?token={resetToken}";

        await SendPasswordResetEmail(user.Email, user.FullName, resetUrl);
    }

    private async Task SendPasswordResetEmail(string? email, string? fullName, string resetUrl)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("Forgot password requested for account without email");
            return;
        }

        var apiKey = Environment.GetEnvironmentVariable("BREVO_API_KEY")
            ?? _configuration["Brevo:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("BREVO_API_KEY is not configured");
            return;
        }

        var fromEmail = Environment.GetEnvironmentVariable("EMAIL_FROM")
            ?? _configuration["Brevo:FromEmail"]
            ?? "noreply@dump.com";

        var fromName = Environment.GetEnvironmentVariable("EMAIL_FROM_NAME")
            ?? _configuration["Brevo:FromName"]
            ?? "Dump";

        var name = string.IsNullOrWhiteSpace(fullName) ? "" : fullName;

        var payload = new
        {
            sender = new
            {
                name = fromName,
                email = fromEmail
            },
            to = new[]
            {
                new
                {
                    email,
                    name
                }
            },
            subject = "Recupere sua senha do Dump",
            htmlContent = $@"
                <div style='font-family: Arial, sans-serif; background: #f5f5f5; padding: 32px;'>
                    <div style='max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px;'>
                        <h2 style='margin: 0 0 16px; color: #111111;'>Recuperação de senha</h2>
                        <p style='font-size: 15px; color: #333333;'>Recebemos uma solicitação para redefinir a senha da sua conta no Dump.</p>
                        <p style='font-size: 15px; color: #333333;'>Clique no botão abaixo para criar uma nova senha.</p>
                        <a href='{resetUrl}' style='display: inline-block; margin: 20px 0; padding: 12px 20px; background: #1881E2; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold;'>Redefinir senha</a>
                        <p style='font-size: 13px; color: #666666;'>Se você não solicitou isso, pode ignorar este email com segurança.</p>
                        <p style='font-size: 12px; color: #999999; margin-top: 24px;'>Por segurança, este link deve expirar em alguns minutos.</p>
                    </div>
                </div>"
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
        request.Headers.Add("api-key", apiKey);
        request.Content = JsonContent.Create(payload);

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Error sending password reset email with Brevo. Status: {StatusCode}. Response: {Response}", response.StatusCode, error);
            return;
        }

        _logger.LogInformation("Password reset email sent to user email {Email}", email);
    }

    public async Task<AuthResponse> RefreshToken(string refreshToken)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);

        if (token == null || token.IsRevoked || token.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token inválido");

        var user = await _userRepository.GetByIdAsync(token.UserId);

        if (user == null)
            throw new NotFoundException("Usuário não encontrado");

        // revoga o token antigo
        token.IsRevoked = true;
        await _refreshTokenRepository.UpdateAsync(token);

        // gera novo access token
        var newAccessToken = GenerateJwt(user);

        // gera novo refresh token
        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = Guid.NewGuid().ToString(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        await _refreshTokenRepository.CreateAsync(newRefreshToken);

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            Email = user.Email,
            Id = user.Id
        };
    }

    private string GenerateJwt(Dump.Domain.Entities.User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY"))
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email)
    };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> GenerateUsername(string fullName)
    {
        // remove espaços e caracteres especiais
        var normalized = new string(fullName
            .ToLower()
            .Where(char.IsLetterOrDigit)
            .ToArray());

        if (string.IsNullOrWhiteSpace(normalized))
            normalized = "user";

        var random = new Random();

        string username;
        bool exists;

        do
        {
            var number = random.Next(100, 9999);
            username = $"{normalized}{number}";

            var user = await _userRepository.GetByUsernameAsync(username);
            exists = user != null;

        } while (exists);

        return username;
    }

    public async Task<Dump.Domain.Entities.User?> GetUserById(string id)
    {
        return await _userRepository.GetByIdAsync(id);
    }
}