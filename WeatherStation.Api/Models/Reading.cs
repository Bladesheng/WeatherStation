namespace WeatherStation.Api.Models;

public class Reading
{
    public int Id { get; set; }

    public required double TemperatureBmp { get; set; }
    public required double TemperatureDht { get; set; }
    public required double PressureBmp { get; set; }
    public required double HumidityDht { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}