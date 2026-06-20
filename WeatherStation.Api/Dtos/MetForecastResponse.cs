using System.Text.Json.Serialization;

namespace WeatherStation.Api.Dtos;

public record MetForecastResponse(
    // [property: JsonPropertyName("type")] string Type,

    // [property: JsonPropertyName("geometry")]
    // ForecastGeometry Geometry,
    [property: JsonPropertyName("properties")]
    ForecastProperties Properties
);

public record ForecastGeometry(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("coordinates")]
    double[] Coordinates
);

public record ForecastProperties(
    // [property: JsonPropertyName("meta")] ForecastMeta Meta,
    [property: JsonPropertyName("timeseries")]
    ForecastTimestep[] Timeseries
);

public record ForecastMeta(
    [property: JsonPropertyName("updated_at")]
    DateTimeOffset UpdatedAt,
    [property: JsonPropertyName("units")] ForecastUnits Units
);

public record ForecastUnits(
    [property: JsonPropertyName("air_pressure_at_sea_level")]
    string AirPressureAtSeaLevel,
    [property: JsonPropertyName("air_temperature")]
    string AirTemperature,
    [property: JsonPropertyName("cloud_area_fraction")]
    string CloudAreaFraction,
    [property: JsonPropertyName("precipitation_amount")]
    string PrecipitationAmount,
    [property: JsonPropertyName("relative_humidity")]
    string RelativeHumidity,
    [property: JsonPropertyName("wind_from_direction")]
    string WindFromDirection,
    [property: JsonPropertyName("wind_speed")]
    string WindSpeed
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
    ForecastSummary Summary,
    [property: JsonPropertyName("details")]
    PeriodDetails Details
);

public record ForecastSummary(
    [property: JsonPropertyName("symbol_code")]
    string SymbolCode
);

public record PeriodDetails(
    [property: JsonPropertyName("precipitation_amount")]
    double? PrecipitationAmount
);