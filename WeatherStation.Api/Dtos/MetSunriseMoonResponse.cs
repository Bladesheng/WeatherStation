using System.Text.Json.Serialization;

namespace WeatherStation.Api.Dtos;

public record MetSunriseMoonResponse(
    [property: JsonPropertyName("properties")]
    MoonProperties Properties
);

public record MoonProperties(
    [property: JsonPropertyName("moonphase")]
    double MoonPhase
);