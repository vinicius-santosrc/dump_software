using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

public interface IMigration
{
    string Version { get; }
    string Name { get; }

    Task Up(IMongoClient mongoClient);
}

 [BsonIgnoreExtraElements]
public class MigrationRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = default!;

    public string Version { get; set; } = default!;
    public string Name { get; set; } = default!;
    public DateTime ExecutedAt { get; set; }
}