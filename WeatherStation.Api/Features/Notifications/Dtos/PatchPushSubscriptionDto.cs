namespace WeatherStation.Api.Features.Notifications.Dtos;

public record PatchPushSubscriptionDto
{
    public required int Id { get; init; }

    public required string Endpoint { get; init; }

    public required TimeOnly SendAt { get; init; }
};