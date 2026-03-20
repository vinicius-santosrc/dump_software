using Dump.Domain.Entities;
using System.Threading.Tasks;

namespace Dump.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task CreateAsync(RefreshToken token);
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task RevokeAsync(string token);
    Task UpdateAsync(RefreshToken token);
}