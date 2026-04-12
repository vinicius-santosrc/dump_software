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

    public async Task<Post[]> GetByUser(string id)
    {
        return (await _posts.Find(_ => true).ToListAsync()).ToArray();
    }

    public async Task<Post[]> GetByUserProfile(string id)
    {
        return (await _posts.Find(p => p.User == id).ToListAsync()).OrderByDescending(p => p.CreatedAt).ToArray();
    }

    public async Task<Post> GetById(string id)
    {
        return await _posts.Find(p => p.Id.ToString() == id).FirstOrDefaultAsync();
    }

    public async Task<Post> UpdatePost(Post post)
    {
        var filter = Builders<Post>.Filter.Eq(p => p.Id, post.Id);

        await _posts.ReplaceOneAsync(filter, post);

        return await _posts.Find(filter).FirstOrDefaultAsync();
    }
}