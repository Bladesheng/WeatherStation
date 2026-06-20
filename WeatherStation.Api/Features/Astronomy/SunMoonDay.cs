namespace WeatherStation.Api.Features.Astronomy;

public record SunMoonDay(
    DateOnly Date,
    DateTimeOffset Sunrise,
    DateTimeOffset Sunset,
    double MoonPhase
);