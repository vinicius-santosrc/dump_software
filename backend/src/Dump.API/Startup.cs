using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Dump.Application.Features.Auth;

namespace Dump.API
{
    public class Startup
    {
        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            // Load environment variables
            DotNetEnv.Env.Load("../../.env");

            // 🔐 JWT key
            var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");

            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new Exception("JWT_KEY not configured in environment variables (.env)");
            }

            var key = Encoding.UTF8.GetBytes(jwtKey);

            // Add controllers and Swagger
            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            services.AddSingleton<Dump.Infrastructure.Persistence.Mongo.MongoContext>();
            services.AddSingleton<MongoDB.Driver.IMongoClient>(sp =>
            {
                var context = sp.GetRequiredService<Dump.Infrastructure.Persistence.Mongo.MongoContext>();
                var connectionString = Environment.GetEnvironmentVariable("MONGO_CONNECTION");
                return new MongoDB.Driver.MongoClient(connectionString);
            });
            services.AddSingleton<MongoDB.Driver.IMongoDatabase>(sp =>
            {
                var client = sp.GetRequiredService<MongoDB.Driver.IMongoClient>();
                var databaseName = Environment.GetEnvironmentVariable("MONGO_DATABASE") ?? "dump_db";
                return client.GetDatabase(databaseName);
            });

            // Repositories
            services.AddScoped<Dump.Application.Interfaces.IUserRepository, Dump.Infrastructure.Persistence.Mongo.Repositories.UserRepository>();
            services.AddScoped<Dump.Application.Interfaces.IRefreshTokenRepository, Dump.Infrastructure.Persistence.Mongo.Repositories.RefreshTokenRepository>();

            // Posts
            services.AddScoped<Dump.Application.Interfaces.IPostsRepository, Dump.Infrastructure.Persistence.Mongo.Repositories.PostsRepository>();
            services.AddScoped<Dump.Application.Interfaces.ICommentsRepository, Dump.Infrastructure.Persistence.Mongo.Repositories.CommentsRepository>();

            // Post service
            services.AddScoped<Dump.Application.Features.Post.PostService>();

            // Comments service
            services.AddScoped<Dump.Application.Features.Post.CommentsService>();

            // User service
            services.AddScoped<Dump.Application.Features.User.UserService>();

            // Message Service
            services.AddScoped<Dump.Application.Features.Messages.MessageService>();

            // Auth service
            services.AddScoped<AuthService>();

            // JWT authentication
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });
        }

        public void Configure(WebApplication app, IWebHostEnvironment env)
        {
            // Middleware
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
        }
    }
}
