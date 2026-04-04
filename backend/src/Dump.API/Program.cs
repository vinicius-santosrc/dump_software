using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Dump.API;
using Dump.API.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IMessagesRepository, MessagesRepository>();
builder.Services.AddCors(options =>
  {
      options.AddPolicy("AllowFrontend",
          policy =>
          {
              policy.WithOrigins("http://localhost:4200")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
          });
  });
builder.Services.AddSignalR();

var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();
app.MapHub<ChatHub>("/chat");
app.UseCors("AllowFrontend");
app.UseRouting();

startup.Configure(app, app.Environment);

app.Run();