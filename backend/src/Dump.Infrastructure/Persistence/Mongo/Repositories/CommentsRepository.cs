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
}