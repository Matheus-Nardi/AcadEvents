using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfiguracoesEvento",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PrazoSubmissao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PrazoAvaliacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NumeroAvaliadoresPorSubmissao = table.Column<int>(type: "int", nullable: false),
                    AvaliacaoDuploCego = table.Column<bool>(type: "bit", nullable: false),
                    PermiteResubmissao = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracoesEvento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DOIs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Valido = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DOIs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Senha = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Instituicao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pais = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Eventos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Local = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Site = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StatusEvento = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConfiguracaoEventoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Eventos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Eventos_ConfiguracoesEvento_ConfiguracaoEventoId",
                        column: x => x.ConfiguracaoEventoId,
                        principalTable: "ConfiguracoesEvento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Autores",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Biografia = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaAtuacao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Lattes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Autores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Autores_Usuarios_Id",
                        column: x => x.Id,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Avaliadores",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Especialidades = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NumeroAvaliacoes = table.Column<int>(type: "int", nullable: false),
                    Disponibilidade = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avaliadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Avaliadores_Usuarios_Id",
                        column: x => x.Id,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notificacoes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mensagem = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataEnvio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Lida = table.Column<bool>(type: "bit", nullable: false),
                    Prioridade = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UsuarioId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notificacoes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Organizadores",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Cargo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Permissoes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Organizadores_Usuarios_Id",
                        column: x => x.Id,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerfisORCID",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrcidId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NomeCompleto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Publicacoes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Verificado = table.Column<bool>(type: "bit", nullable: false),
                    UsuarioId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfisORCID", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfisORCID_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ComitesCientificos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EventoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComitesCientificos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComitesCientificos_Eventos_EventoId",
                        column: x => x.EventoId,
                        principalTable: "Eventos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoricosEvento",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Acao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Detalhes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UsuarioId = table.Column<long>(type: "bigint", nullable: false),
                    EventoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricosEvento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricosEvento_Eventos_EventoId",
                        column: x => x.EventoId,
                        principalTable: "Eventos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistoricosEvento_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Trilhas",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Coordenador = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LimiteSubmissoes = table.Column<int>(type: "int", nullable: false),
                    EventoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trilhas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trilhas_Eventos_EventoId",
                        column: x => x.EventoId,
                        principalTable: "Eventos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EventoOrganizador",
                columns: table => new
                {
                    EventosOrganizadosId = table.Column<long>(type: "bigint", nullable: false),
                    OrganizadoresId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventoOrganizador", x => new { x.EventosOrganizadosId, x.OrganizadoresId });
                    table.ForeignKey(
                        name: "FK_EventoOrganizador_Eventos_EventosOrganizadosId",
                        column: x => x.EventosOrganizadosId,
                        principalTable: "Eventos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventoOrganizador_Organizadores_OrganizadoresId",
                        column: x => x.OrganizadoresId,
                        principalTable: "Organizadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ComiteAvaliador",
                columns: table => new
                {
                    ComitesId = table.Column<long>(type: "bigint", nullable: false),
                    MembrosAvaliadoresId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComiteAvaliador", x => new { x.ComitesId, x.MembrosAvaliadoresId });
                    table.ForeignKey(
                        name: "FK_ComiteAvaliador_Avaliadores_MembrosAvaliadoresId",
                        column: x => x.MembrosAvaliadoresId,
                        principalTable: "Avaliadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComiteAvaliador_ComitesCientificos_ComitesId",
                        column: x => x.ComitesId,
                        principalTable: "ComitesCientificos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ComiteOrganizador",
                columns: table => new
                {
                    ComitesCoordenadosId = table.Column<long>(type: "bigint", nullable: false),
                    CoordenadoresId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComiteOrganizador", x => new { x.ComitesCoordenadosId, x.CoordenadoresId });
                    table.ForeignKey(
                        name: "FK_ComiteOrganizador_ComitesCientificos_ComitesCoordenadosId",
                        column: x => x.ComitesCoordenadosId,
                        principalTable: "ComitesCientificos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComiteOrganizador_Organizadores_CoordenadoresId",
                        column: x => x.CoordenadoresId,
                        principalTable: "Organizadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sessoes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Sala = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Moderador = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TrilhaId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sessoes_Trilhas_TrilhaId",
                        column: x => x.TrilhaId,
                        principalTable: "Trilhas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrilhasTematicas",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PalavrasChave = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TrilhaId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrilhasTematicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrilhasTematicas_Trilhas_TrilhaId",
                        column: x => x.TrilhaId,
                        principalTable: "Trilhas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Submissoes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Resumo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PalavrasChave = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataSubmissao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaModificacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Versao = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Formato = table.Column<int>(type: "int", nullable: false),
                    AutorId = table.Column<long>(type: "bigint", nullable: false),
                    TrilhaId = table.Column<long>(type: "bigint", nullable: false),
                    TrilhaTematicaId = table.Column<long>(type: "bigint", nullable: false),
                    SessaoId = table.Column<long>(type: "bigint", nullable: true),
                    DOIId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Submissoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Submissoes_Autores_AutorId",
                        column: x => x.AutorId,
                        principalTable: "Autores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Submissoes_DOIs_DOIId",
                        column: x => x.DOIId,
                        principalTable: "DOIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Submissoes_Sessoes_SessaoId",
                        column: x => x.SessaoId,
                        principalTable: "Sessoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Submissoes_TrilhasTematicas_TrilhaTematicaId",
                        column: x => x.TrilhaTematicaId,
                        principalTable: "TrilhasTematicas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Submissoes_Trilhas_TrilhaId",
                        column: x => x.TrilhaId,
                        principalTable: "Trilhas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ArquivosSubmissao",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomeArquivo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tamanho = table.Column<long>(type: "bigint", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Caminho = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataUpload = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Versao = table.Column<int>(type: "int", nullable: false),
                    SubmissaoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArquivosSubmissao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArquivosSubmissao_Submissoes_SubmissaoId",
                        column: x => x.SubmissaoId,
                        principalTable: "Submissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Avaliacoes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NotaGeral = table.Column<double>(type: "float", nullable: false),
                    NotaOriginalidade = table.Column<double>(type: "float", nullable: false),
                    NotaMetodologia = table.Column<double>(type: "float", nullable: false),
                    NotaRelevancia = table.Column<double>(type: "float", nullable: false),
                    NotaRedacao = table.Column<double>(type: "float", nullable: false),
                    Recomendacao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Confidencial = table.Column<bool>(type: "bit", nullable: false),
                    AvaliadorId = table.Column<long>(type: "bigint", nullable: false),
                    SubmissaoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avaliacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Avaliacoes_Avaliadores_AvaliadorId",
                        column: x => x.AvaliadorId,
                        principalTable: "Avaliadores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Avaliacoes_Submissoes_SubmissaoId",
                        column: x => x.SubmissaoId,
                        principalTable: "Submissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConvitesAvaliacao",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DataConvite = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataResposta = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PrazoAvaliacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Aceito = table.Column<bool>(type: "bit", nullable: true),
                    MotivoRecusa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AvaliadorId = table.Column<long>(type: "bigint", nullable: false),
                    SubmissaoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConvitesAvaliacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConvitesAvaliacao_Avaliadores_AvaliadorId",
                        column: x => x.AvaliadorId,
                        principalTable: "Avaliadores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ConvitesAvaliacao_Submissoes_SubmissaoId",
                        column: x => x.SubmissaoId,
                        principalTable: "Submissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Referencias",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Autores = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ano = table.Column<int>(type: "int", nullable: false),
                    Publicacao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Volume = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Paginas = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FormatoABNT = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubmissaoId = table.Column<long>(type: "bigint", nullable: false),
                    DOIId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Referencias_DOIs_DOIId",
                        column: x => x.DOIId,
                        principalTable: "DOIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referencias_Submissoes_SubmissaoId",
                        column: x => x.SubmissaoId,
                        principalTable: "Submissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArquivosSubmissao_SubmissaoId",
                table: "ArquivosSubmissao",
                column: "SubmissaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Avaliacoes_AvaliadorId",
                table: "Avaliacoes",
                column: "AvaliadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Avaliacoes_SubmissaoId",
                table: "Avaliacoes",
                column: "SubmissaoId");

            migrationBuilder.CreateIndex(
                name: "IX_ComiteAvaliador_MembrosAvaliadoresId",
                table: "ComiteAvaliador",
                column: "MembrosAvaliadoresId");

            migrationBuilder.CreateIndex(
                name: "IX_ComiteOrganizador_CoordenadoresId",
                table: "ComiteOrganizador",
                column: "CoordenadoresId");

            migrationBuilder.CreateIndex(
                name: "IX_ComitesCientificos_EventoId",
                table: "ComitesCientificos",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_ConvitesAvaliacao_AvaliadorId",
                table: "ConvitesAvaliacao",
                column: "AvaliadorId");

            migrationBuilder.CreateIndex(
                name: "IX_ConvitesAvaliacao_SubmissaoId",
                table: "ConvitesAvaliacao",
                column: "SubmissaoId");

            migrationBuilder.CreateIndex(
                name: "IX_EventoOrganizador_OrganizadoresId",
                table: "EventoOrganizador",
                column: "OrganizadoresId");

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_ConfiguracaoEventoId",
                table: "Eventos",
                column: "ConfiguracaoEventoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_Nome",
                table: "Eventos",
                column: "Nome");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosEvento_EventoId",
                table: "HistoricosEvento",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosEvento_UsuarioId",
                table: "HistoricosEvento",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_UsuarioId",
                table: "Notificacoes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_PerfisORCID_UsuarioId",
                table: "PerfisORCID",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Referencias_DOIId",
                table: "Referencias",
                column: "DOIId");

            migrationBuilder.CreateIndex(
                name: "IX_Referencias_SubmissaoId",
                table: "Referencias",
                column: "SubmissaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessoes_TrilhaId",
                table: "Sessoes",
                column: "TrilhaId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_AutorId",
                table: "Submissoes",
                column: "AutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_DOIId",
                table: "Submissoes",
                column: "DOIId",
                unique: true,
                filter: "[DOIId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_SessaoId",
                table: "Submissoes",
                column: "SessaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_TrilhaId",
                table: "Submissoes",
                column: "TrilhaId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissoes_TrilhaTematicaId",
                table: "Submissoes",
                column: "TrilhaTematicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Trilhas_EventoId",
                table: "Trilhas",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_TrilhasTematicas_TrilhaId",
                table: "TrilhasTematicas",
                column: "TrilhaId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArquivosSubmissao");

            migrationBuilder.DropTable(
                name: "Avaliacoes");

            migrationBuilder.DropTable(
                name: "ComiteAvaliador");

            migrationBuilder.DropTable(
                name: "ComiteOrganizador");

            migrationBuilder.DropTable(
                name: "ConvitesAvaliacao");

            migrationBuilder.DropTable(
                name: "EventoOrganizador");

            migrationBuilder.DropTable(
                name: "HistoricosEvento");

            migrationBuilder.DropTable(
                name: "Notificacoes");

            migrationBuilder.DropTable(
                name: "PerfisORCID");

            migrationBuilder.DropTable(
                name: "Referencias");

            migrationBuilder.DropTable(
                name: "ComitesCientificos");

            migrationBuilder.DropTable(
                name: "Avaliadores");

            migrationBuilder.DropTable(
                name: "Organizadores");

            migrationBuilder.DropTable(
                name: "Submissoes");

            migrationBuilder.DropTable(
                name: "Autores");

            migrationBuilder.DropTable(
                name: "DOIs");

            migrationBuilder.DropTable(
                name: "Sessoes");

            migrationBuilder.DropTable(
                name: "TrilhasTematicas");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Trilhas");

            migrationBuilder.DropTable(
                name: "Eventos");

            migrationBuilder.DropTable(
                name: "ConfiguracoesEvento");
        }
    }
}
