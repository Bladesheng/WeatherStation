using System.Net;
using System.Text.Json;
using WebPush;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WeatherStation.Api.Data;
 using WeatherStation.Api.Features.Forecasts;

namespace WeatherStation.Api.Features.Notifications;

public class NotificationWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<NotificationsOptions> options,
    ILogger<NotificationWorker> logger,
    MetService metService
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

        do
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await SendNotificationsAsync(dbContext, ct);
            }
            catch (Exception e)
            {
                logger.LogError(e, "Notification job failed.");
            }
        } while (
            await timer.WaitForNextTickAsync(ct)
        );
    }


    private async Task SendNotificationsAsync(AppDbContext dbContext, CancellationToken ct)
    {
        var cetZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Prague");

        var nowCet = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, cetZone);

        var nowCetTime = TimeOnly.FromDateTime(nowCet);

        var nowCetDate = nowCet.Date;
        var nowUtcDate = TimeZoneInfo.ConvertTimeToUtc(nowCetDate, cetZone);

        var dueSubscriptions = await dbContext.PushSubscriptions
            // Everything from midnight to now.
            .Where(s => s.SendAt <= nowCetTime)
            // But only those that have not been sent today yet.
            .Where(s => s.LastSentAt.Date < nowUtcDate)
            .ToListAsync(ct);

        if (dueSubscriptions.Count == 0)
            return;

        var forecastSummary = await metService.GetForecastSummary();

        await Task.WhenAll(
            dueSubscriptions.Select(s => SendOneAsync(s, forecastSummary))
        );
    }

    private async Task SendOneAsync(PushSubscription subscription, ForecastSummary forecastSummary)
    {
        var webPushClient = new WebPushClient();
        var pushSubscription = new WebPush.PushSubscription(
            subscription.Endpoint,
            subscription.P256Dh,
            subscription.Auth
        );

        webPushClient.SetVapidDetails(new VapidDetails(
            $"mailto:{options.Value.SubjectEmail}",
            options.Value.VapidKeyPublic,
            options.Value.VapidKeyPrivate
        ));

        var notificationOptions = new Dictionary<string, object>
        {
            // 5 hours
            { "TTL", 5 * 60 * 60 }
        };

        var payload = JsonSerializer.Serialize(new
        {
            title = "Forecast",
            icon = forecastSummary.Icon,
            body = forecastSummary.Body
        });

        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        try
        {
            await webPushClient.SendNotificationAsync(
                pushSubscription,
                payload,
                notificationOptions
            );
        }
        catch (WebPushException e)
        {
            if (e.StatusCode is HttpStatusCode.Gone or HttpStatusCode.NotFound)
                // Subscription is expired/invalid.
                await dbContext.PushSubscriptions
                    .Where(s => s.Id == subscription.Id)
                    .ExecuteDeleteAsync();

            return;
        }

        await dbContext.PushSubscriptions
            .Where(s => s.Id == subscription.Id)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(s => s.LastSentAt, DateTime.UtcNow)
            );
    }
}