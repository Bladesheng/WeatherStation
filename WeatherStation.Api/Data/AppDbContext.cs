using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.Models;

namespace WeatherStation.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public virtual DbSet<Reading> Readings { get; set; }
}