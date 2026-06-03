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

        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexes = new[]
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

        _posts.Indexes.CreateMany(indexes);
    }

    private static BsonDocument LightweightVideoMediaStage()
    {
        return new BsonDocument("$set", new BsonDocument("media",
            new BsonDocument("$map", new BsonDocument
            {
                { "input", "$media" },
                { "as", "m" },
                { "in", new BsonDocument
                    {
                        {
                            "url",
                            new BsonDocument("$cond", new BsonArray
                            {
                                new BsonDocument("$eq", new BsonArray { "$$m.type", "video" }),
                                string.Empty,
                                "$$m.url"
                            })
                        },
                        { "thumbnail", "$$m.thumbnail" },
                        { "width", "$$m.width" },
                        { "height", "$$m.height" },
                        { "type", "$$m.type" },
                        { "duration", new BsonDocument("$ifNull", new BsonArray { "$$m.duration", 0 }) }
                    }
                }
            })
        ));
    }

    private static BsonDocument ProfileGridMediaStage()
    {
        return new BsonDocument("$set", new BsonDocument("media",
            new BsonDocument("$map", new BsonDocument
            {
                { "input", "$media" },
                { "as", "m" },
                { "in", new BsonDocument
                    {
                        { "url", string.Empty },
                        { "thumbnail", "$$m.thumbnail" },
                        { "width", "$$m.width" },
                        { "height", "$$m.height" },
                        { "type", "$$m.type" },
                        { "duration", new BsonDocument("$ifNull", new BsonArray { "$$m.duration", 0 }) }
                    }
                }
            })
        ));
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
        limit = Math.Clamp(limit, 1, 8);

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

        var posts = await _posts
            .Aggregate()
            .Match(filter)
            .Sort(Builders<Post>.Sort.Descending(p => p.CreatedAt))
            .Limit(limit)
            .AppendStage<Post>(ProfileGridMediaStage())
            .ToListAsync();

        return posts.ToArray();
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

    public async Task<Post[]> GetByUserProfile(
        string userId,
        DateTime? cursor = null,
        int limit = 12
    )
    {
        limit = Math.Clamp(limit, 1, 24);

        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Eq(p => p.User, userId),
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

        var posts = await _posts
            .Aggregate()
            .Match(filter)
            .Sort(Builders<Post>.Sort.Descending(p => p.CreatedAt))
            .Limit(limit)
            .AppendStage<Post>(ProfileGridMediaStage())
            .ToListAsync();

        return posts.ToArray();
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

    public async Task<Post[]> GetDumpsByUserProfile(
        string id,
        DateTime? cursor = null,
        int limit = 6
    )
    {
        limit = Math.Clamp(limit, 1, 8);

        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Ne(p => p.User, id),
            Builders<Post>.Filter.ElemMatch(p => p.Media, m => m.Type == "video"),
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

        var posts = await _posts
            .Aggregate()
            .Match(filter)
            .Sort(Builders<Post>.Sort.Descending(p => p.CreatedAt))
            .Limit(limit)
            .AppendStage<Post>(LightweightVideoMediaStage())
            .ToListAsync();

        return posts.ToArray();
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
        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Eq(p => p.User, userId),
            Builders<Post>.Filter.Eq(p => p.IsDeleted, false),
            Builders<Post>.Filter.Eq(p => p.Archived, true)
        );

        var options = new FindOptions<Post>
        {
            Sort = Builders<Post>.Sort.Descending(p => p.CreatedAt),
            AllowDiskUse = true
        };

        using var result = await _posts.FindAsync(filter, options);
        return await result.ToListAsync();
    }

}