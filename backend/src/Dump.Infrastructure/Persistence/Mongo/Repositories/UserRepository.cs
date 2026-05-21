using Dump.Application.Interfaces;
using Dump.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace Dump.Infrastructure.Persistence.Mongo.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("dump_dev");
        _users = database.GetCollection<User>("users");
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var userfounded = await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        return userfounded;
    }

    public async Task<User?> GetByPhoneNumberAsync(string phoneNumber)
    {
        var userfounded = await _users.Find(u => u.PhoneNumber == phoneNumber).FirstOrDefaultAsync();
        return userfounded;
    }
    public async Task<User?> GetByUsernameAsync(string username)
        => await _users.Find(u => u.Username == username).FirstOrDefaultAsync();

    public  async Task<User?> GetByIdAsync(string id)
        => await _users.Find(u => u.Id.ToString() == id).FirstOrDefaultAsync();

    public async Task CreateAsync(User user)
        => await _users.InsertOneAsync(user);

    public async Task UpdateAsync(User user)
        => await _users.ReplaceOneAsync(u => u.Id == user.Id, user);

    public async Task DeleteAsync(string id)
    {

        await _users.DeleteOneAsync(u => u.Id == id);
    }

    public async Task<User[]> GetByIdsAsync(string[] ids)
    {
        if (ids == null || ids.Length == 0)
            return Array.Empty<User>();

        var filter = Builders<User>.Filter.In(u => u.Id, ids);
        var users = await _users.Find(filter).ToListAsync();

        return users.ToArray();
    }

    public async Task<User[]> GetRandomUsersAsync(int limit)
    {
        if (limit <= 0)
            return Array.Empty<User>();

        var pipeline = new[]
        {
            new BsonDocument("$sample", new BsonDocument("size", limit))
        };

        var users = await _users.Aggregate<User>(pipeline).ToListAsync();

        return users.ToArray();
    }

    public async Task<User[]> GetRelatedByCurrentUser(string id)
    {
        var usersfounded = await _users.Find(u => u.Id != id).ToListAsync();
        return usersfounded.ToArray();
    }

    public async Task UpdateUsers(User currentUser, User targetUser)
    {
        await _users.ReplaceOneAsync(u => u.Id == currentUser.Id, currentUser);
        await _users.ReplaceOneAsync(u => u.Id == targetUser.Id, targetUser);
    }
}