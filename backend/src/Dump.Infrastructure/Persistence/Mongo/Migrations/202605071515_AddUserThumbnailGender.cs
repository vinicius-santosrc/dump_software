using Dump.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Dump.Infrastructure.Persistence.Mongo.Migrations
{
    public class AddUserThumbnailGender : IMigration
    {
        public string Version => "202605071515";
        public string Name => "AddUserThumbnailGender";

        public async Task Up(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("dump_dev");
            var users = database.GetCollection<User>("users");

            var allUsers = await users
                .Find(Builders<User>.Filter.Empty)
                .ToListAsync();

            var bulkOps = new List<WriteModel<User>>();

            foreach (var user in allUsers)
            {
                var thumbnail = user.Thumbnail;
                var gender = user.Gender;

                if (string.IsNullOrEmpty(thumbnail))
                {
                    thumbnail = user.ProfilePictureUrl;
                }

                if (string.IsNullOrEmpty(gender))
                {
                    gender = "prefer_not_to_say";
                }

                var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);

                var update = Builders<User>.Update
                    .Set(u => u.Thumbnail, thumbnail)
                    .Set(u => u.Gender, gender);

                bulkOps.Add(new UpdateOneModel<User>(filter, update));
            }

            System.Console.WriteLine($"Updating {bulkOps.Count} users with thumbnail and gender...");

            await users.BulkWriteAsync(bulkOps);
        }
    }
}
