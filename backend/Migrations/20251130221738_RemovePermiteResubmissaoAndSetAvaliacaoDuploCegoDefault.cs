using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class RemovePermiteResubmissaoAndSetAvaliacaoDuploCegoDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove a coluna PermiteResubmissao
            migrationBuilder.DropColumn(
                name: "PermiteResubmissao",
                table: "ConfiguracoesEvento");

            // Define valor padrão para AvaliacaoDuploCego
            migrationBuilder.AlterColumn<bool>(
                name: "AvaliacaoDuploCego",
                table: "ConfiguracoesEvento",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverte o valor padrão de AvaliacaoDuploCego
            migrationBuilder.AlterColumn<bool>(
                name: "AvaliacaoDuploCego",
                table: "ConfiguracoesEvento",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            // Recria a coluna PermiteResubmissao
            migrationBuilder.AddColumn<bool>(
                name: "PermiteResubmissao",
                table: "ConfiguracoesEvento",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
