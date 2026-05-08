using Dump.Domain.Entities;
using System.Threading.Tasks;

namespace Dump.Application.Interfaces;

public interface ICommentsRepository
{
    Task<Comment[]> GetByPostIdAsync(string postId);

    Task<Comment?> GetByIdAsync(string id);
    Task RemoveAsync(string id);
    Task UpdateAsync(Comment comment);
}