using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using Dump.Domain.Entities;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories
{
    public class SearchRepository : ISearchRepository
    {
        private readonly IMongoCollection<User> _users;
        private readonly IMongoCollection<Post> _posts;

        public SearchRepository(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("dump_dev");

            _users = database.GetCollection<User>("users");
            _posts = database.GetCollection<Post>("posts");
        }

        public async Task<List<UserDto>> SearchUsersAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<UserDto>();

            var filter = Builders<User>.Filter.Regex(
                u => u.Username,
                new MongoDB.Bson.BsonRegularExpression($".*{query}.*", "i")
            );

            var projection = Builders<User>.Projection.Expression(u => new UserDto
            {
                Id = u.Id.ToString(),
                FullName = u.FullName,
                Username = u.Username,
                Thumbnail = u.Thumbnail
            });

            return await _users
                .Find(filter)
                .Project(projection)
                .Limit(10)
                .ToListAsync();
        }

        public async Task<List<PostDto>> SearchPostsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<PostDto>();

            var filter = Builders<Post>.Filter.Regex(
                p => p.Caption,
                new MongoDB.Bson.BsonRegularExpression($".*{query}.*", "i")
            );

            var projection = Builders<Post>.Projection.Expression(p => new PostDto
            {
                Id = p.Id.ToString(),
                Media = p.Media,
                Caption = p.Caption,
            });

            return await _posts
                .Find(filter)
                .Project(projection)
                .Limit(12)
                .ToListAsync();
        }
    }
}
