using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WeatherStation.Api.Data;
using WeatherStation.Api.Features.Forecasts;

var builder = WebApplication.CreateBuilder(args);


builder.Services.Configure<MetOptions>(
    builder.Configuration.GetSection(MetOptions.SectionName)
);

builder.Services.AddHttpClient<MetService>((serviceProvider, client) =>
{
    var metOptions = serviceProvider
        .GetRequiredService<IOptions<MetOptions>>()
        .Value;

    client.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", metOptions.UserAgent);
    client.BaseAddress = new Uri("https://api.met.no/");
});

builder.Services.AddControllers();

var connectionString = builder.Configuration.GetConnectionString("PostgresConnection") ??
                       throw new InvalidOperationException("`PostgresConnection` string not found");

builder.Services.AddDbContextPool<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

builder.Services.AddMemoryCache();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();