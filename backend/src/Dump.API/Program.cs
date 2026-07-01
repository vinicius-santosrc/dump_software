using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Dump.API;
using Dump.API.Hubs;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IMessagesRepository, MessagesRepository>();
builder.Services.AddCors(options =>
  {
    options.AddPolicy("AllowFrontend",
        policy =>
        {
          policy.WithOrigins(
              "https://dump-software.vercel.app",
              "http://localhost:4200",
              "http://localhost:3000"
              )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
  });
builder.Services.AddSignalR();

var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();
var storageRoot = System.IO.Path.Combine(app.Environment.ContentRootPath, "storage");
Directory.CreateDirectory(storageRoot);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(storageRoot),
    RequestPath = "/cdn/v",
    OnPrepareResponse = context =>
    {
        context.Context.Response.Headers.CacheControl = "public,max-age=604800,immutable";
    }
});
app.MapHub<ChatHub>("/chat");
app.UseCors("AllowFrontend");
app.UseRouting();

startup.Configure(app, app.Environment);

app.Run();