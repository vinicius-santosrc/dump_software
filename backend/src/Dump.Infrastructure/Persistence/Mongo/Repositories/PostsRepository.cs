using Dump.Application.Features.TrendingTopic;
using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class PostsRepository : IPostsRepository
{
    private readonly IMongoCollection<Post> _posts;

    public PostsRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("dump_dev");
        _posts = database.GetCollection<Post>("posts");
    }
    public async Task CreateAsync(Post post)
    {
        await _posts.InsertOneAsync(post);
    }

    public async Task<Post[]> GetByUser(
        string id,
        DateTime? cursor = null,
        int limit = 10
    )
    {
        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Ne(p => p.User, id),
            Builders<Post>.Filter.Eq(p => p.IsDeleted, false),
            Builders<Post>.Filter.Eq(p => p.Archived, false)
        );

        if (cursor.HasValue)
        {
            filter &= Builders<Post>.Filter.Lt(
                p => p.CreatedAt,
                cursor.Value.ToUniversalTime()
            );
        }

        return (await _posts
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Limit(limit)
            .ToListAsync())
            .ToArray();
    }

    public async Task<List<Post>> GetArchivedAsync(string userId)
    {
        return await _posts
            .Find(p =>
                p.User == userId &&
                !p.IsDeleted &&
                p.Archived
            )
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Post>> GetByUserProfile(string userId)
    {
        return await _posts
            .Find(p =>
                p.User == userId &&
                !p.IsDeleted &&
                !p.Archived
            )
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Post> GetById(string id)
    {
        return await _posts
            .Find(p =>
                p.Id.ToString() == id &&
                !p.IsDeleted &&
                !p.Archived)
            .SortByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<Post> UpdatePost(Post post)
    {
        var filter = Builders<Post>.Filter.Eq(p => p.Id, post.Id);

        await _posts.ReplaceOneAsync(filter, post);

        return await _posts.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<Post[]> GetDumpsByUserProfile(string id)
    {
        var filter = Builders<Post>.Filter.And(
            // Builders<Post>.Filter.Eq(p => p.User, id),
            Builders<Post>.Filter.ElemMatch(p => p.Media, m => m.Type == "video"),
            Builders<Post>.Filter.Eq(p => p.IsDeleted, false),
            Builders<Post>.Filter.Eq(p => p.Archived, false)
        );

        return (await _posts
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync())
            .ToArray();
    }

    public async Task ArchiveAsync(string postId)

    {

        var update = Builders<Post>.Update

            .Set(p => p.Archived, true)

            .Set(p => p.UpdatedAt, DateTime.UtcNow);

        await _posts.UpdateOneAsync(p => p.Id == postId, update);

    }

    public async Task UnarchiveAsync(string postId)

    {

        var update = Builders<Post>.Update

            .Set(p => p.Archived, false)

            .Set(p => p.UpdatedAt, DateTime.UtcNow);

        await _posts.UpdateOneAsync(p => p.Id == postId, update);

    }

    public async Task SoftDeleteAsync(string postId)

    {

        var update = Builders<Post>.Update

            .Set(p => p.IsDeleted, true)

            .Set(p => p.UpdatedAt, DateTime.UtcNow);

        await _posts.UpdateOneAsync(p => p.Id == postId, update);

    }

    public async Task RestoreAsync(string postId)

    {

        var update = Builders<Post>.Update

            .Set(p => p.IsDeleted, false)

            .Set(p => p.UpdatedAt, DateTime.UtcNow);

        await _posts.UpdateOneAsync(p => p.Id == postId, update);

    }

    public async Task<List<Post>> GetArchivedByUser(string userId)
    {
        return await _posts
            .Find(p =>
                p.User == userId &&
                !p.IsDeleted &&
                p.Archived
            )
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

}