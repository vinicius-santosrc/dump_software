using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class CommentsRepository : ICommentsRepository
{
    private readonly IMongoCollection<Comment> _comments;

    public CommentsRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("dump_dev");
        _comments = database.GetCollection<Comment>("comments");
    }

    public async Task<Comment[]> GetByPostIdAsync(string postId)
    {
        return (await _comments.Find(c => c.PostReference == postId).ToListAsync()).ToArray();
    }

    public async Task<Comment?> GetByIdAsync(string id)
    {
        return await _comments.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task RemoveAsync(string id)
    {
        var update = Builders<Comment>.Update
            .Set(c => c.IsDeleted, true)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        await _comments.UpdateOneAsync(
            c => c.Id == id,
            update
        );
    }

    public async Task UpdateAsync(Comment comment)
    {
        await _comments.ReplaceOneAsync(c => c.Id == comment.Id, comment);
    }
}