using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WeatherStation.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int[]>(
                name: "Days",
                table: "PushSubscriptions",
                type: "integer[]",
                nullable: false,
                // Existing subscriptions keep firing every day.
                defaultValue: new[] { 0, 1, 2, 3, 4, 5, 6 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Days",
                table: "PushSubscriptions");
        }
    }
}
