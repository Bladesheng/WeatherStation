using Microsoft.AspNetCore.Mvc;

namespace WeatherStation.Api.Features.Forecasts;

[ApiController]
[Route("[controller]")]
public class ForecastController(
    MetService metService
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Forecast()
    {
        var forecast = await metService.GetForecastTimeseriesAsync();

        var sunMoon = await metService.GetSunMoonAsync();

        return Ok(new
        {
            forecast,
            sunMoon
        });
    }
}