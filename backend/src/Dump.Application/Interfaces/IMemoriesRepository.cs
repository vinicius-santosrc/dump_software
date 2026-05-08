using Dump.Domain.Entities;

namespace Dump.Application.Interfaces;

public interface IMemoriesRepository
{
    Task<Memorie?> GetById(string id);
    Task<List<Memorie>> GetActiveByUserId(string userId);
    Task<List<Memorie>> GetActiveByUserIds(List<string> userIds);
}