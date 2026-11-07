using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using WeatherStation.Api.Data;

namespace WeatherStation.Api.Features.Readings;

[ApiController]
[Route("api/readings")]
public class ReadingsController(
    AppDbContext dbContext,
    IConfiguration configuration,
    IMemoryCache cache
) : ControllerBase
{
    [HttpGet("24h")]
    public async Task<ActionResult> Get24H()
    {
        var latestReadingDateTime = await dbContext.Readings
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        var etag = new EntityTagHeaderValue($"\"{latestReadingDateTime.Ticks}\"");

        if (Request.Headers.IfNoneMatch.ToString() == etag.ToString())
            return StatusCode(StatusCodes.Status304NotModified);

        var readings = await dbContext.Readings
            .Where(r => r.CreatedAt >= DateTime.UtcNow.AddHours(-24))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        Response.Headers.ETag = etag.ToString();

        return Ok(readings);
    }

    [HttpGet("month/{year:int}/{month:int}")]
    public async Task<ActionResult<IEnumerable<Reading>>> GetMonth(int year, int month)
    {
        // Months follow the station's local time, otherwise a UTC month leaks
        // the first hours of the next local month (and misses its own first hours).
        var cetZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Prague");
        var nowCet = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, cetZone);

        var isCurrentMonth = year == nowCet.Year && month == nowCet.Month;

        Response.Headers.CacheControl = isCurrentMonth
            ? "public, max-age=300"
            : "public, max-age=2592000, immutable";

        var cacheKey = $"readings_month_{year}_{month}";
        if (cache.TryGetValue(cacheKey, out List<Reading>? cached) && cached != null) return cached;


        var startCet = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Unspecified);
        var start = TimeZoneInfo.ConvertTimeToUtc(startCet, cetZone);
        var end = TimeZoneInfo.ConvertTimeToUtc(startCet.AddMonths(1), cetZone);

        var readings = await dbContext.Readings
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        var downsampled = Lttb.Downsample(readings);


        cache.Set(cacheKey, downsampled, new MemoryCacheEntryOptions
            {
                // The current month is still changing - short cache.
                // Past months don't change - cache forever.
                AbsoluteExpirationRelativeToNow = isCurrentMonth ? TimeSpan.FromMinutes(5) : null
            }
        );


        return Ok(downsampled);
    }

    [HttpPost]
    public async Task<ActionResult> Store(
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