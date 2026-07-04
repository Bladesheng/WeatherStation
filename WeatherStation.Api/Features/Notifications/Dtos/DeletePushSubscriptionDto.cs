namespace WeatherStation.Api.Features.Notifications.Dtos;

public record DeletePushSubscriptionDto
{
    public required int Id { get; init; }

    public required string Endpoint { get; init; }
};