using System.Text.Json.Serialization;

namespace WeatherStation.Api.Features.Forecasts;

public record MetForecastResponse(
    [property: JsonPropertyName("properties")]
    ForecastProperties Properties
);

public record ForecastProperties(
    [property: JsonPropertyName("timeseries")]
    ForecastTimestep[] Timeseries
);

public record ForecastTimestep(
    [property: JsonPropertyName("time")] DateTimeOffset Time,
    [property: JsonPropertyName("data")] ForecastData Data
);

public record ForecastData(
    [property: JsonPropertyName("instant")]
    ForecastInstant Instant,
    [property: JsonPropertyName("next_1_hours")]
    ForecastPeriod? Next1Hours,
    [property: JsonPropertyName("next_6_hours")]
    ForecastPeriod? Next6Hours,
    [property: JsonPropertyName("next_12_hours")]
    ForecastPeriod? Next12Hours
);

public record ForecastInstant(
    [property: JsonPropertyName("details")]
    InstantDetails Details
);

public record InstantDetails(
    [property: JsonPropertyName("air_pressure_at_sea_level")]
    double AirPressureAtSeaLevel,
    [property: JsonPropertyName("air_temperature")]
    double AirTemperature,
    [property: JsonPropertyName("cloud_area_fraction")]
    double CloudAreaFraction,
    [property: JsonPropertyName("relative_humidity")]
    double RelativeHumidity,
    [property: JsonPropertyName("wind_from_direction")]
    double WindFromDirection,
    [property: JsonPropertyName("wind_speed")]
    double WindSpeed
);

public record ForecastPeriod(
    [property: JsonPropertyName("summary")]
    Summary Summary,
    [property: JsonPropertyName("details")]
    PeriodDetails Details
);

public record Summary(
    [property: JsonPropertyName("symbol_code")]
    string SymbolCode
);

public record PeriodDetails(
    [property: JsonPropertyName("precipitation_amount")]
    double? PrecipitationAmount
);