namespace WeatherStation.Api.Features.Forecasts;

public record ForecastSummary()
{
    public required string Icon { get; init; }
    public required string Body { get; init; }
};