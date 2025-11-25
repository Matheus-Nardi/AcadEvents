using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class AltAvaliacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataFim",
                table: "Avaliacoes");

            migrationBuilder.RenameColumn(
                name: "DataInicio",
                table: "Avaliacoes",
                newName: "DataCriacao");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DataCriacao",
                table: "Avaliacoes",
                newName: "DataInicio");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataFim",
                table: "Avaliacoes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
