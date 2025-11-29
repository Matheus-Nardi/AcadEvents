using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSubmissaoTrilhaRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissoes_Trilhas_TrilhaId",
                table: "Submissoes");

            migrationBuilder.DropIndex(
                name: "IX_Submissoes_TrilhaId",
                table: "Submissoes");

            migrationBuilder.DropColumn(
                name: "TrilhaId",
                table: "Submissoes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "TrilhaId",
                table: "Submissoes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_TrilhaId",
                table: "Submissoes",
                column: "TrilhaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissoes_Trilhas_TrilhaId",
                table: "Submissoes",
                column: "TrilhaId",
                principalTable: "Trilhas",
                principalColumn: "Id");
        }
    }
}
