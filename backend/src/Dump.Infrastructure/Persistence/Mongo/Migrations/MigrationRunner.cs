using MongoDB.Driver;

public class MigrationRunner
{
    private readonly IMongoClient _client;
    private readonly IMongoDatabase _database;
    private readonly IEnumerable<IMigration> _migrations;

    public MigrationRunner(
        IMongoClient client,
        IMongoDatabase database,
        IEnumerable<IMigration> migrations)
    {
        _client = client;
        _database = database;
        _migrations = migrations;
    }

    public async Task RunAsync()
    {
        var collection = _database.GetCollection<MigrationRecord>("migrations");

        var executed = await collection
            .Find(_ => true)
            .ToListAsync();

        foreach (var migration in _migrations.OrderBy(x => x.Version))
        {
            var alreadyExecuted = executed
                .Any(x => x.Version == migration.Version);

            if (alreadyExecuted)
                continue;

            Console.WriteLine($"Running migration {migration.Version}");

            await migration.Up(_client);

            await collection.InsertOneAsync(new MigrationRecord
            {
                Version = migration.Version,
                Name = migration.Name,
                ExecutedAt = DateTime.UtcNow
            });
        }
    }
}