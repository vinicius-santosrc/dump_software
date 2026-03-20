using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Dump.API;

var builder = WebApplication.CreateBuilder(args);

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

var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();
app.UseCors("AllowFrontend");
app.UseRouting();

startup.Configure(app, app.Environment);

app.Run();