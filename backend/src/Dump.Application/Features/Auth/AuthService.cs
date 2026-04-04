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

namespace Dump.Application.Features.Auth;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _logger = logger;
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