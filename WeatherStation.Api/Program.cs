using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = builder.Configuration.GetConnectionString("PostgresConnection") ??
                       throw new InvalidOperationException("`PostgresConnection` string not found");

builder.Services.AddDbContextPool<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

builder.Services.AddMemoryCache();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();