namespace WeatherStation.Api.Dtos;

public record SunMoonDay(
    DateOnly Date,
    DateTimeOffset Sunrise,
    DateTimeOffset Sunset,
    double MoonPhase
);