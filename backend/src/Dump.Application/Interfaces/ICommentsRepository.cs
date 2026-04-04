using Dump.Domain.Entities;
using System.Threading.Tasks;

namespace Dump.Application.Interfaces;

public interface ICommentsRepository
{
    Task<Comment[]> GetByPostIdAsync(string postId);
}