namespace WeatherStation.Api.Features.Forecasts;

public class MetOptions
{
    public const string SectionName = "Met";

    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public int Altitude { get; init; }
    public required string UserAgent { get; init; }
}