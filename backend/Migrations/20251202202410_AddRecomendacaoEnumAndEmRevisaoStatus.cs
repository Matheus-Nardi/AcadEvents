using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class AddRecomendacaoEnumAndEmRevisaoStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecomendacaoEnum",
                table: "Avaliacoes",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecomendacaoEnum",
                table: "Avaliacoes");
        }
    }
}
