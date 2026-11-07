namespace WeatherStation.Api.Features.Notifications.Dtos;

public record PatchPushSubscriptionDto
{
    public required int Id { get; init; }

    public required string Endpoint { get; init; }

    public TimeOnly? SendAt { get; init; }

    public DayOfWeek[]? Days { get; init; }
};