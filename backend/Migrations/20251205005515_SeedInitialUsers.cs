using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcadEvents.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Hash da senha "123" gerado com BCrypt
            var senhaHash = "$2a$11$xP89yUUptv7hKNEbu2DLoeVuECOmm/Y4y2Wvopo8sNYpKBig84kf6";
            var dataCadastro = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            var instituicao = "Universidade Estadual do Tocantins - UNITINS";
            var pais = "Brasil";

            // Inserir Organizador (Id = 1)
            migrationBuilder.Sql($@"
                INSERT INTO Usuarios (Nome, Email, Senha, Instituicao, Pais, DataCadastro, Ativo)
                VALUES (N'Leandra Cristina Cavina Piovesan Soares', N'organizador@email.com', N'{senhaHash}', N'{instituicao}', N'{pais}', '{dataCadastro}', 1);
                
                INSERT INTO Organizadores (Id, Cargo, Permissoes)
                VALUES (1, N'Coordenador', N'[""GerenciarEventos"", ""GerenciarComites"", ""GerenciarAvaliadores""]');
            ");

            // Inserir Avaliador 1 (Id = 2)
            migrationBuilder.Sql($@"
                INSERT INTO Usuarios (Nome, Email, Senha, Instituicao, Pais, DataCadastro, Ativo)
                VALUES (N'Jose Itamar Mendes de Souza Junior', N'avaliador@email.com', N'{senhaHash}', N'{instituicao}', N'{pais}', '{dataCadastro}', 1);
                
                INSERT INTO Avaliadores (Id, Especialidades, NumeroAvaliacoes, Disponibilidade)
                VALUES (2, N'[""Sistemas de Informação"", ""Engenharia de Software""]', 0, 1);
            ");

            // Inserir Avaliador 2 (Id = 3)
            migrationBuilder.Sql($@"
                INSERT INTO Usuarios (Nome, Email, Senha, Instituicao, Pais, DataCadastro, Ativo)
                VALUES (N'Janio Elias Teixeira Junior', N'avaliador2@email.com', N'{senhaHash}', N'{instituicao}', N'{pais}', '{dataCadastro}', 1);
                
                INSERT INTO Avaliadores (Id, Especialidades, NumeroAvaliacoes, Disponibilidade)
                VALUES (3, N'[""Banco de Dados"", ""Arquitetura de Sistemas""]', 0, 1);
            ");

            // Inserir Avaliador 3 (Id = 4)
            migrationBuilder.Sql($@"
                INSERT INTO Usuarios (Nome, Email, Senha, Instituicao, Pais, DataCadastro, Ativo)
                VALUES (N'Marcia Maria Savoine', N'avaliador3@email.com', N'{senhaHash}', N'{instituicao}', N'{pais}', '{dataCadastro}', 1);
                
                INSERT INTO Avaliadores (Id, Especialidades, NumeroAvaliacoes, Disponibilidade)
                VALUES (4, N'[""Inteligência Artificial"", ""Mineração de Dados""]', 0, 1);
            ");

            // Inserir Avaliador 4 (Id = 5)
            migrationBuilder.Sql($@"
                INSERT INTO Usuarios (Nome, Email, Senha, Instituicao, Pais, DataCadastro, Ativo)
                VALUES (N'Mailson Santos de Oliveira', N'avaliador4@email.com', N'{senhaHash}', N'{instituicao}', N'{pais}', '{dataCadastro}', 1);
                
                INSERT INTO Avaliadores (Id, Especialidades, NumeroAvaliacoes, Disponibilidade)
                VALUES (5, N'[""Redes de Computadores"", ""Segurança da Informação""]', 0, 1);
            ");

            // Inserir Autor (Id = 6)
            migrationBuilder.Sql($@"
                INSERT INTO Usuarios (Nome, Email, Senha, Instituicao, Pais, DataCadastro, Ativo)
                VALUES (N'Tayse Virgulino Ribeiro', N'autor@email.com', N'{senhaHash}', N'{instituicao}', N'{pais}', '{dataCadastro}', 1);
                
                INSERT INTO Autores (Id, Biografia, AreaAtuacao, Lattes)
                VALUES (6, N'Professora e pesquisadora na área de Sistemas de Informação na Universidade Estadual do Tocantins.', N'Sistemas de Informação', N'http://lattes.cnpq.br/0000000000000000');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remover na ordem inversa (tabelas específicas primeiro, depois Usuarios)
            migrationBuilder.Sql(@"
                DELETE FROM Organizadores WHERE Id IN (1);
                DELETE FROM Avaliadores WHERE Id IN (2, 3, 4, 5);
                DELETE FROM Autores WHERE Id IN (6);
                DELETE FROM Usuarios WHERE Id IN (1, 2, 3, 4, 5, 6);
            ");
        }
    }
}
