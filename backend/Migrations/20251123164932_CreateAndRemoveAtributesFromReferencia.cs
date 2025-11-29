using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class CreateAndRemoveAtributesFromReferencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FormatoABNT",
                table: "Referencias");

            migrationBuilder.DropColumn(
                name: "Paginas",
                table: "Referencias");

            migrationBuilder.DropColumn(
                name: "Volume",
                table: "Referencias");

            migrationBuilder.AddColumn<string>(
                name: "Abstract",
                table: "Referencias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Publisher",
                table: "Referencias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoPublicacao",
                table: "Referencias",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Abstract",
                table: "Referencias");

            migrationBuilder.DropColumn(
                name: "Publisher",
                table: "Referencias");

            migrationBuilder.DropColumn(
                name: "TipoPublicacao",
                table: "Referencias");

            migrationBuilder.AddColumn<string>(
                name: "FormatoABNT",
                table: "Referencias",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Paginas",
                table: "Referencias",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Volume",
                table: "Referencias",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
