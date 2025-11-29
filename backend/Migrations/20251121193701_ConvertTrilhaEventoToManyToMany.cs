using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class ConvertTrilhaEventoToManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Primeiro, criar a tabela EventoTrilha
            migrationBuilder.CreateTable(
                name: "EventoTrilha",
                columns: table => new
                {
                    EventosId = table.Column<long>(type: "bigint", nullable: false),
                    TrilhasId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventoTrilha", x => new { x.EventosId, x.TrilhasId });
                    table.ForeignKey(
                        name: "FK_EventoTrilha_Eventos_EventosId",
                        column: x => x.EventosId,
                        principalTable: "Eventos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventoTrilha_Trilhas_TrilhasId",
                        column: x => x.TrilhasId,
                        principalTable: "Trilhas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Migrar dados existentes de Trilhas.EventoId para EventoTrilha
            migrationBuilder.Sql(@"
                INSERT INTO EventoTrilha (EventosId, TrilhasId)
                SELECT EventoId, Id
                FROM Trilhas
                WHERE EventoId IS NOT NULL;
            ");

            // Remover a foreign key e índice antigos de Trilhas
            migrationBuilder.DropForeignKey(
                name: "FK_Trilhas_Eventos_EventoId",
                table: "Trilhas");

            migrationBuilder.DropIndex(
                name: "IX_Trilhas_EventoId",
                table: "Trilhas");

            // Remover a coluna EventoId de Trilhas
            migrationBuilder.DropColumn(
                name: "EventoId",
                table: "Trilhas");

            // Adicionar EventoId em Submissoes como nullable primeiro
            migrationBuilder.AddColumn<long>(
                name: "EventoId",
                table: "Submissoes",
                type: "bigint",
                nullable: true);

            // Preencher EventoId em Submissoes baseado na trilha temática -> trilha -> evento
            migrationBuilder.Sql(@"
                UPDATE s
                SET s.EventoId = (
                    SELECT TOP 1 et.EventosId
                    FROM TrilhasTematicas tt
                    INNER JOIN Trilhas t ON tt.TrilhaId = t.Id
                    INNER JOIN EventoTrilha et ON t.Id = et.TrilhasId
                    WHERE tt.Id = s.TrilhaTematicaId
                )
                FROM Submissoes s
                WHERE s.EventoId IS NULL
                AND EXISTS (
                    SELECT 1
                    FROM TrilhasTematicas tt
                    INNER JOIN Trilhas t ON tt.TrilhaId = t.Id
                    INNER JOIN EventoTrilha et ON t.Id = et.TrilhasId
                    WHERE tt.Id = s.TrilhaTematicaId
                );
            ");

            // Tornar a coluna EventoId obrigatória em Submissoes
            migrationBuilder.AlterColumn<long>(
                name: "EventoId",
                table: "Submissoes",
                type: "bigint",
                nullable: false);

            // Criar índice e foreign key para Submissoes.EventoId
            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_EventoId",
                table: "Submissoes",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_EventoTrilha_TrilhasId",
                table: "EventoTrilha",
                column: "TrilhasId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissoes_Eventos_EventoId",
                table: "Submissoes",
                column: "EventoId",
                principalTable: "Eventos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissoes_Eventos_EventoId",
                table: "Submissoes");

            migrationBuilder.DropTable(
                name: "EventoTrilha");

            migrationBuilder.DropIndex(
                name: "IX_Submissoes_EventoId",
                table: "Submissoes");

            migrationBuilder.DropColumn(
                name: "EventoId",
                table: "Submissoes");

            migrationBuilder.AddColumn<long>(
                name: "EventoId",
                table: "Trilhas",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trilhas_EventoId",
                table: "Trilhas",
                column: "EventoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trilhas_Eventos_EventoId",
                table: "Trilhas",
                column: "EventoId",
                principalTable: "Eventos",
                principalColumn: "Id");
        }
    }
}
