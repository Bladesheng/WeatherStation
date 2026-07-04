using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WeatherStation.Api.Data;
using WeatherStation.Api.Features.Notifications.Dtos;

namespace WeatherStation.Api.Features.Notifications;

[ApiController]
[Route("[controller]")]
public class NotificationsController(
    AppDbContext dbContext,
    IOptions<NotificationsOptions> options
) : ControllerBase
{
    [HttpGet("vapid-public-key")]
    public async Task<ActionResult> VapidKeyPublic()
    {
        return Ok(new { vapidKeyPublic = options.Value.VapidKeyPublic });
    }


    [HttpGet("subscriptions")]
    public async Task<ActionResult> GetAll([FromQuery] string endpoint)
    {
        var subscriptions = await dbContext.PushSubscriptions
            .Where(s => s.Endpoint == endpoint)
            .OrderBy(s => s.SendAt)
            .Select(s => new
            {
                s.Id,
                s.SendAt
            })
            .ToListAsync();

        return Ok(subscriptions);
    }

    [HttpPost("subscriptions")]
    public async Task<ActionResult> Create(
        [FromBody] CreatePushSubscriptionDto dto
    )
    {
        var pushSubscription = new PushSubscription
        {
            Auth = dto.Auth,
            Endpoint = dto.Endpoint,
            P256Dh = dto.P256Dh,
            SendAt = dto.SendAt
        };

        dbContext.Add(pushSubscription);
        await dbContext.SaveChangesAsync();

        return StatusCode(201);
    }


    [HttpPatch("subscriptions")]
    public async Task<ActionResult> Patch(
        [FromBody] PatchPushSubscriptionDto dto
    )
    {
        var affected = await dbContext.PushSubscriptions
            .Where(s => s.Id == dto.Id && s.Endpoint == dto.Endpoint)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(s => s.SendAt, dto.SendAt)
                // Reset LastSentAt, so that you can receive notification from this subscription today again.
                .SetProperty(s => s.LastSentAt, DateTime.UnixEpoch)
            );

        if (affected == 0)
            return NotFound();

        return NoContent();
    }


    [HttpDelete("subscriptions")]
    public async Task<ActionResult> Delete(
        [FromBody] DeletePushSubscriptionDto dto
    )
    {
        var affected = await dbContext.PushSubscriptions
            .Where(s => s.Id == dto.Id && s.Endpoint == dto.Endpoint)
            .ExecuteDeleteAsync();

        if (affected == 0)
            return NotFound();

        return NoContent();
    }
}