using System.ComponentModel.DataAnnotations;

namespace WeatherStation.Api.Features.Notifications;

public class PushSubscription
{
    public int Id { get; set; }

    [Required] [StringLength(256)] public required string Endpoint { get; set; }
    [Required] [StringLength(256)] public required string P256Dh { get; set; }
    [Required] [StringLength(256)] public required string Auth { get; set; }

    public TimeOnly SendAt { get; set; }

    public DayOfWeek[] Days { get; set; } = Enum.GetValues<DayOfWeek>();

    public DateTime LastSentAt { get; set; } = DateTime.UnixEpoch;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}