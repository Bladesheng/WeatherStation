using System.Text.Json.Serialization;

namespace WeatherStation.Api.Features.Readings;

public record StoreReadingDto
{
    [property: JsonPropertyName("temperature_bmp")]
    public required double TemperatureBmp { get; init; }

    [property: JsonPropertyName("temperature_dht")]
    public required double TemperatureDht { get; init; }

    [property: JsonPropertyName("pressure_bmp")]
    public required double PressureBmp { get; init; }

    [property: JsonPropertyName("humidity_dht")]
    public required double HumidityDht { get; init; }
};