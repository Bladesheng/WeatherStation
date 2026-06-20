using Microsoft.AspNetCore.Mvc;
using WeatherStation.Api.Services;

namespace WeatherStation.Api.Controllers;

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
        return Ok(forecast);
    }
}