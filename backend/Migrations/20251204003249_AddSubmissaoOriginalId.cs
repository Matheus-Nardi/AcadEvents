using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmissaoOriginalId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SubmissaoOriginalId",
                table: "Submissoes",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_SubmissaoOriginalId",
                table: "Submissoes",
                column: "SubmissaoOriginalId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissoes_Submissoes_SubmissaoOriginalId",
                table: "Submissoes",
                column: "SubmissaoOriginalId",
                principalTable: "Submissoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissoes_Submissoes_SubmissaoOriginalId",
                table: "Submissoes");

            migrationBuilder.DropIndex(
                name: "IX_Submissoes_SubmissaoOriginalId",
                table: "Submissoes");

            migrationBuilder.DropColumn(
                name: "SubmissaoOriginalId",
                table: "Submissoes");
        }
    }
}
