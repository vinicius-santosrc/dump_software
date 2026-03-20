using System;
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
    }

    public IMongoCollection<T> GetCollection<T>(string name)
    {
        return _database.GetCollection<T>(name);
    }
}
