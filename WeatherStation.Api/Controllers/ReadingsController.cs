using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.Data;
using WeatherStation.Api.Dtos;
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
            .ToListAsync();

        return readings;
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