using System.Net;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using WeatherStation.Api.Features.Astronomy;

namespace WeatherStation.Api.Features.Forecasts;

public class MetService(
    HttpClient httpClient,
    IOptions<MetOptions> options,
    IMemoryCache cache
)
{
    private const string CacheKeyForecastTimeseries = "CacheKeyForecastTimeseries";

    private static DateTimeOffset? _lastModified;
    private static DateTimeOffset? _expires;

    // MET TOS says maximum is 20 req/s.
    private static readonly SemaphoreSlim _semaphore = new(10, 10);

    public async Task<List<ForecastTimestep>> GetForecastTimeseriesAsync()
    {
        if (
            _expires > DateTimeOffset.UtcNow &&
            cache.TryGetValue(CacheKeyForecastTimeseries, out List<ForecastTimestep>? cached) &&
            cached != null
        )
            return cached;

        var url =
            $"weatherapi/locationforecast/2.0/compact?lat={options.Value.Latitude}&lon={options.Value.Longitude}&altitude={options.Value.Altitude}";

        var request = new HttpRequestMessage(HttpMethod.Get, url);

        if (_lastModified != null)
            request.Headers.IfModifiedSince = _lastModified;

        var response = await httpClient.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotModified)
        {
            if (
                cache.TryGetValue(CacheKeyForecastTimeseries,
                    out List<ForecastTimestep>? cachedData) &&
                cachedData != null
            )
                return cachedData;

            // Cache was empty, but MET didn't return anything - re-fetch without the header
            _lastModified = null;
            return await GetForecastTimeseriesAsync();
        }

        response.EnsureSuccessStatusCode();

        // This header is sometimes missing
        _lastModified = response.Content.Headers.LastModified ?? DateTimeOffset.UtcNow;

        // This header is sometimes missing - assume the update will be in 40 minutes
        // (updates are published every ~30 minutes).
        _expires = response.Content.Headers.Expires ?? DateTimeOffset.UtcNow.AddMinutes(40);
        // Add random delay - MET TOS.
        _expires = _expires.Value.AddMinutes(Random.Shared.Next(3, 7));

        var forecast = await response.Content.ReadFromJsonAsync<MetForecastResponse>() ??
                       throw new InvalidOperationException(
                           "Failed to deserialize MET forecast response"
                       );

        var timeseries = forecast.Properties.Timeseries
            // Keep only time steps that have precipitation data and icon. Discard the rest.
            .Where(t => t.Data.Next1Hours != null || t.Data.Next6Hours != null)
            .ToList();

        cache.Set(CacheKeyForecastTimeseries, timeseries);

        return timeseries;
    }

    public async Task<List<SunMoonDay>> GetSunMoonAsync()
    {
        return (await Task.WhenAll(
                Enumerable.Range(0, 10)
                    .Select(async i =>
                        {
                            var date = DateOnly.FromDateTime(DateTime.Today.AddDays(i));

                            var sunTask = GetSunriseSunsetAsync(date);
                            var moonTask = GetMoonPhaseAsync(date);
                            var (sun, moonPhase) = (await sunTask, await moonTask);

                            return new SunMoonDay(
                                date,
                                sun.Sunrise,
                                sun.Sunset,
                                moonPhase
                            );
                        }
                    ))
            )
            .ToList();
    }

    private async Task<SunriseSunset> GetSunriseSunsetAsync(DateOnly date)
    {
        var cacheKey = $"sunriseSun_{date}";
        if (cache.TryGetValue(cacheKey, out SunriseSunset? cached) && cached != null)
            return cached;

        await _semaphore.WaitAsync();
        try
        {
            var result = await httpClient.GetFromJsonAsync<MetSunriseSunResponse>(
                             $"weatherapi/sunrise/3.0/sun?lat={options.Value.Latitude}&lon={options.Value.Longitude}&date={date.ToString("yyyy-MM-dd")}"
                         )
                         ?? throw new InvalidOperationException("Sunrise sun response was null");

            var sunriseSunset = new SunriseSunset(
                result.Properties.Sunrise.Time,
                result.Properties.Sunset.Time
            );

            cache.Set(cacheKey, sunriseSunset, date.AddDays(1).ToDateTime(TimeOnly.MaxValue));

            return sunriseSunset;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task<double> GetMoonPhaseAsync(DateOnly date)
    {
        var cacheKey = $"sunriseMoon_{date}";
        if (cache.TryGetValue(cacheKey, out double cached))
            return cached;

        await _semaphore.WaitAsync();
        try
        {
            var result = await httpClient.GetFromJsonAsync<MetSunriseMoonResponse>(
                             $"weatherapi/sunrise/3.0/moon?lat={options.Value.Latitude}&lon={options.Value.Longitude}&date={date.ToString("yyyy-MM-dd")}"
                         )
                         ?? throw new InvalidOperationException("Sunrise moon response was null");

            var moonPhase = result.Properties.MoonPhase;

            cache.Set(cacheKey, moonPhase, date.AddDays(1).ToDateTime(TimeOnly.MaxValue));

            return moonPhase;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<ForecastSummary> GetForecastSummary()
    {
        var forecast = await GetForecastTimeseriesAsync();

        var today = DateTimeOffset.Now.Date;
        var forecastToday = forecast
            .Where(f => f.Time.Date == today)
            .ToList();

        var tempMax = forecastToday.Max(f => f.Data.Instant.Details.AirTemperature);
        var tempMin = forecastToday.Min(f => f.Data.Instant.Details.AirTemperature);

        var precipitationTotal = forecastToday
            .Sum(f => f.Data.Next1Hours?.Details.PrecipitationAmount ?? 0);

        var body = $"Temperature: {tempMax:F0}˚ / {tempMin:F0}˚\n";
        if (precipitationTotal > 0)
            body += $"Precipitation: {precipitationTotal:0.#} mm";

        var icon = forecastToday[0].Data.Next12Hours?.Summary.SymbolCode ??
                   "heavysnowshowersandthunder_day";

        return new ForecastSummary
        {
            Icon = icon,
            Body = body
        };
    }
}