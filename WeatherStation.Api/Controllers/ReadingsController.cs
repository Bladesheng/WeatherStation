using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.Data;
using WeatherStation.Api.Dtos;
using WeatherStation.Api.Helpers;
using WeatherStation.Api.Models;

namespace WeatherStation.Api.Controllers;

[ApiController]
[Route("api/readings")]
public class ReadingsController(
    AppDbContext dbContext,
    IConfiguration configuration
) : ControllerBase
{
    [HttpGet("24h")]
    public async Task<IEnumerable<Reading>> Get24H()
    {
        var readings = await dbContext.Readings
            .Where(r => r.CreatedAt >= DateTime.UtcNow.AddHours(-24))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return readings;
    }

    [HttpGet("month/{year:int}/{month:int}")]
    public async Task<IEnumerable<Reading>> GetMonth(int year, int month)
    {
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);

        var readings = await dbContext.Readings
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return Lttb.Downsample(readings);
    }

    [HttpPost]
    public async Task<IActionResult> Store(
        [FromBody] StoreReadingDto readingDto,
        [FromHeader] string? password
    )
    {
        if (configuration["ApiPassword"] == null)
            return Problem();

        if (password != configuration["ApiPassword"])
            return Unauthorized();

        var reading = new Reading
        {
            TemperatureBmp = readingDto.TemperatureBmp,
            TemperatureDht = readingDto.TemperatureDht,
            PressureBmp = readingDto.PressureBmp,
            HumidityDht = readingDto.HumidityDht
        };

        dbContext.Readings.Add(reading);
        await dbContext.SaveChangesAsync();

        return Ok();
    }
}