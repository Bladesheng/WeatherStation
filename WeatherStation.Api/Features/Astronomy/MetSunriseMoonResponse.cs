using System.Text.Json.Serialization;

namespace WeatherStation.Api.Features.Astronomy;

public record MetSunriseMoonResponse(
    [property: JsonPropertyName("properties")]
    MoonProperties Properties
);

public record MoonProperties(
    [property: JsonPropertyName("moonphase")]
    double MoonPhase
);