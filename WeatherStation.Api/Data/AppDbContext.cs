using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.Features.Notifications;
using WeatherStation.Api.Features.Readings;

namespace WeatherStation.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public virtual DbSet<Reading> Readings { get; set; }
    public virtual DbSet<PushSubscription> PushSubscriptions { get; set; }
}