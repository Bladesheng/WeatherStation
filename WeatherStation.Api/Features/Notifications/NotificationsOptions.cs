namespace WeatherStation.Api.Features.Notifications;

public class NotificationsOptions
{
    public const string SectionName = "Notifications";

    public required string VapidKeyPrivate { get; init; }
    public required string VapidKeyPublic { get; init; }
    public required string SubjectEmail { get; init; }
}