using System.Net;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using WeatherStation.Api.Dtos;
using WeatherStation.Api.Options;

namespace WeatherStation.Api.Services;

public class MetService(
    HttpClient httpClient,
    IOptions<MetOptions> options,
    IMemoryCache cache
)
{
    private const string CacheKeyForecastTimeseries = "CacheKeyForecastTimeseries";

    private static DateTimeOffset? _lastModified;
    private static DateTimeOffset? _expires;

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
}