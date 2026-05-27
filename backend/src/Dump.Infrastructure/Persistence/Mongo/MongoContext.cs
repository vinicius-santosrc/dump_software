using System;
using Dump.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Dump.Infrastructure.Persistence.Mongo;

public class MongoContext
{
    private readonly IMongoDatabase _database;

    public MongoContext()
    {
        var connectionUri = Environment.GetEnvironmentVariable("MONGO_CONNECTION");
        var settings = MongoClientSettings.FromConnectionString(connectionUri);

        settings.ServerApi = new ServerApi(ServerApiVersion.V1);

        var client = new MongoClient(settings);
        _database = client.GetDatabase("dump_dev");

        CreateIndexes();
    }

    public IMongoCollection<T> GetCollection<T>(string name)
    {
        return _database.GetCollection<T>(name);
    }

    private void CreateIndexes()
    {
        var posts = _database.GetCollection<Post>("posts");

        var postIndexes = new[]
        {
            new CreateIndexModel<Post>(
                Builders<Post>.IndexKeys
                    .Ascending(p => p.IsDeleted)
                    .Ascending(p => p.Archived)
                    .Descending(p => p.CreatedAt),
                new CreateIndexOptions
                {
                    Name = "idx_posts_active_createdAt"
                }
            ),
            new CreateIndexModel<Post>(
                Builders<Post>.IndexKeys
                    .Ascending("media.type")
                    .Ascending(p => p.IsDeleted)
                    .Ascending(p => p.Archived)
                    .Descending(p => p.CreatedAt),
                new CreateIndexOptions
                {
                    Name = "idx_posts_video_active_createdAt"
                }
            ),
            new CreateIndexModel<Post>(
                Builders<Post>.IndexKeys
                    .Ascending(p => p.User)
                    .Ascending(p => p.IsDeleted)
                    .Ascending(p => p.Archived)
                    .Descending(p => p.CreatedAt),
                new CreateIndexOptions
                {
                    Name = "idx_posts_user_active_createdAt"
                }
            )
        };

        posts.Indexes.CreateMany(postIndexes);
    }
}
