using System.Text.Json.Serialization;

namespace WeatherStation.Api.Features.Astronomy;

public record MetSunriseSunResponse(
    [property: JsonPropertyName("properties")]
    SunProperties Properties
);

public record SunProperties(
    [property: JsonPropertyName("sunrise")]
    SunEvent Sunrise,
    [property: JsonPropertyName("sunset")] SunEvent Sunset
);

public record SunEvent(
    [property: JsonPropertyName("time")] DateTimeOffset Time
);