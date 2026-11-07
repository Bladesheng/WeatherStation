namespace WeatherStation.Api.Features.Notifications.Dtos;

public record CreatePushSubscriptionDto
{
    public required string Endpoint { get; init; }

    public required string P256Dh { get; init; }

    public required string Auth { get; init; }

    public required TimeOnly SendAt { get; init; }

    public required DayOfWeek[] Days { get; init; }
};