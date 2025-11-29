using Microsoft.EntityFrameworkCore;
using AcadEvents.Models;

namespace AcadEvents.Data;

public class AcadEventsDbContext : DbContext
{
    public AcadEventsDbContext(DbContextOptions<AcadEventsDbContext> options) : base(options)
    {
    }

    // DbSets para todas as entidades
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Autor> Autores { get; set; }
    public DbSet<Avaliador> Avaliadores { get; set; }
    public DbSet<Organizador> Organizadores { get; set; }
    public DbSet<Evento> Eventos { get; set; }
    public DbSet<Submissao> Submissoes { get; set; }
    public DbSet<Avaliacao> Avaliacoes { get; set; }
    public DbSet<Trilha> Trilhas { get; set; }
    public DbSet<TrilhaTematica> TrilhasTematicas { get; set; }
    public DbSet<ComiteCientifico> ComitesCientificos { get; set; }
    public DbSet<ConfiguracaoEvento> ConfiguracoesEvento { get; set; }
    public DbSet<ArquivoSubmissao> ArquivosSubmissao { get; set; }
    public DbSet<Referencia> Referencias { get; set; }
    public DbSet<Sessao> Sessoes { get; set; }
    public DbSet<DOI> DOIs { get; set; }
    public DbSet<ConviteAvaliacao> ConvitesAvaliacao { get; set; }
    public DbSet<HistoricoEvento> HistoricosEvento { get; set; }
    public DbSet<Notificacao> Notificacoes { get; set; }
    public DbSet<PerfilORCID> PerfisORCID { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração de herança TPT (Table Per Type) para Usuario
        // Cada classe derivada terá sua própria tabela
        modelBuilder.Entity<Usuario>()
            .ToTable("Usuarios");

        modelBuilder.Entity<Autor>()
            .ToTable("Autores");

        modelBuilder.Entity<Avaliador>()
            .ToTable("Avaliadores");

        modelBuilder.Entity<Organizador>()
            .ToTable("Organizadores");

        // Configuração de List<string> como JSON no SQL Server
        modelBuilder.Entity<Submissao>()
            .Property(s => s.PalavrasChave)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );

        modelBuilder.Entity<TrilhaTematica>()
            .Property(tt => tt.PalavrasChave)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );

        modelBuilder.Entity<Avaliador>()
            .Property(a => a.Especialidades)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );

        modelBuilder.Entity<Organizador>()
            .Property(o => o.Permissoes)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );

        modelBuilder.Entity<PerfilORCID>()
            .Property(p => p.Publicacoes)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );

        // Configuração de relacionamento um-para-um entre Usuario e PerfilORCID
        // PerfilORCID é o lado dependente (tem a FK UsuarioId)
        // Ignora PerfilORCIDId de Usuario, pois a FK real está em PerfilORCID.UsuarioId
        modelBuilder.Entity<Usuario>()
            .Ignore(u => u.PerfilORCIDId);

        modelBuilder.Entity<PerfilORCID>()
            .HasOne(p => p.Usuario)
            .WithOne(u => u.PerfilORCID)
            .HasForeignKey<PerfilORCID>(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configuração de relacionamentos um-para-muitos com controle de cascade
        // Evita múltiplos caminhos de cascade que causam erro no SQL Server
        
        // Submissao -> Autor (NO ACTION para evitar ciclo)
        modelBuilder.Entity<Submissao>()
            .HasOne(s => s.Autor)
            .WithMany(a => a.Submissoes)
            .HasForeignKey(s => s.AutorId)
            .OnDelete(DeleteBehavior.NoAction);

        // Submissao -> Evento (NO ACTION)
        modelBuilder.Entity<Submissao>()
            .HasOne(s => s.Evento)
            .WithMany()
            .HasForeignKey(s => s.EventoId)
            .OnDelete(DeleteBehavior.NoAction);

        // Submissao -> TrilhaTematica (NO ACTION)
        modelBuilder.Entity<Submissao>()
            .HasOne(s => s.TrilhaTematica)
            .WithMany(tt => tt.Submissoes)
            .HasForeignKey(s => s.TrilhaTematicaId)
            .OnDelete(DeleteBehavior.NoAction);

        // Submissao -> Sessao (SET NULL, pois é opcional)
        modelBuilder.Entity<Submissao>()
            .HasOne(s => s.Sessao)
            .WithMany(sess => sess.SubmissoesApresentadas)
            .HasForeignKey(s => s.SessaoId)
            .OnDelete(DeleteBehavior.SetNull);

        // Submissao -> DOI (SET NULL, pois é opcional - relacionamento um-para-um)
        modelBuilder.Entity<Submissao>()
            .HasOne(s => s.DOI)
            .WithOne(d => d.Submissao)
            .HasForeignKey<Submissao>(s => s.DOIId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configuração de relacionamento muitos-para-muitos
        // Trilha <-> Evento (N:N)
        modelBuilder.Entity<Trilha>()
            .HasMany(t => t.Eventos)
            .WithMany(e => e.Trilhas)
            .UsingEntity(j => j.ToTable("EventoTrilha"));

        // TrilhaTematica -> Trilha (CASCADE, opcional)
        modelBuilder.Entity<TrilhaTematica>()
            .HasOne(tt => tt.Trilha)
            .WithMany(t => t.Tematicas)
            .HasForeignKey(tt => tt.TrilhaId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        // Sessao -> Trilha (CASCADE faz sentido)
        modelBuilder.Entity<Sessao>()
            .HasOne(s => s.Trilha)
            .WithMany(t => t.Sessoes)
            .HasForeignKey(s => s.TrilhaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Evento -> ConfiguracaoEvento (CASCADE faz sentido)
        modelBuilder.Entity<Evento>()
            .HasOne(e => e.Configuracao)
            .WithOne(c => c.Evento)
            .HasForeignKey<Evento>(e => e.ConfiguracaoEventoId)
            .OnDelete(DeleteBehavior.Cascade);

        // ComiteCientifico -> Evento (CASCADE faz sentido)
        modelBuilder.Entity<ComiteCientifico>()
            .HasOne(c => c.Evento)
            .WithMany(e => e.Comites)
            .HasForeignKey(c => c.EventoId)
            .OnDelete(DeleteBehavior.Cascade);

        // HistoricoEvento -> Evento (CASCADE faz sentido)
        modelBuilder.Entity<HistoricoEvento>()
            .HasOne(h => h.Evento)
            .WithMany(e => e.Historico)
            .HasForeignKey(h => h.EventoId)
            .OnDelete(DeleteBehavior.Cascade);

        // HistoricoEvento -> Usuario (NO ACTION para evitar ciclo)
        modelBuilder.Entity<HistoricoEvento>()
            .HasOne(h => h.Usuario)
            .WithMany(u => u.Historicos)
            .HasForeignKey(h => h.UsuarioId)
            .OnDelete(DeleteBehavior.NoAction);

        // Notificacao -> Usuario (CASCADE faz sentido)
        modelBuilder.Entity<Notificacao>()
            .HasOne(n => n.Usuario)
            .WithMany(u => u.Notificacoes)
            .HasForeignKey(n => n.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Submissao -> ArquivoSubmissao (CASCADE faz sentido)
        modelBuilder.Entity<ArquivoSubmissao>()
            .HasOne(a => a.Submissao)
            .WithMany(s => s.Arquivos)
            .HasForeignKey(a => a.SubmissaoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Submissao -> Referencia (CASCADE faz sentido)
        modelBuilder.Entity<Referencia>()
            .HasOne(r => r.Submissao)
            .WithMany(s => s.Referencias)
            .HasForeignKey(r => r.SubmissaoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Referencia -> DOI (SET NULL, pois é opcional)
        modelBuilder.Entity<Referencia>()
            .HasOne(r => r.DOI)
            .WithMany(d => d.Referencias)
            .HasForeignKey(r => r.DOIId)
            .OnDelete(DeleteBehavior.SetNull);

        // Submissao -> Avaliacao (CASCADE faz sentido)
        modelBuilder.Entity<Avaliacao>()
            .HasOne(a => a.Submissao)
            .WithMany(s => s.Avaliacoes)
            .HasForeignKey(a => a.SubmissaoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Avaliacao -> Avaliador (NO ACTION para evitar ciclo)
        modelBuilder.Entity<Avaliacao>()
            .HasOne(a => a.Avaliador)
            .WithMany(av => av.AvaliacoesRealizadas)
            .HasForeignKey(a => a.AvaliadorId)
            .OnDelete(DeleteBehavior.NoAction);

        // Submissao -> ConviteAvaliacao (CASCADE faz sentido)
        modelBuilder.Entity<ConviteAvaliacao>()
            .HasOne(c => c.Submissao)
            .WithMany(s => s.Convites)
            .HasForeignKey(c => c.SubmissaoId)
            .OnDelete(DeleteBehavior.Cascade);

        // ConviteAvaliacao -> Avaliador (NO ACTION para evitar ciclo)
        modelBuilder.Entity<ConviteAvaliacao>()
            .HasOne(c => c.Avaliador)
            .WithMany(a => a.ConvitesRecebidos)
            .HasForeignKey(c => c.AvaliadorId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configuração de relacionamentos muitos-para-muitos
        // Evento <-> Organizador
        modelBuilder.Entity<Evento>()
            .HasMany(e => e.Organizadores)
            .WithMany(o => o.EventosOrganizados)
            .UsingEntity(j => j.ToTable("EventoOrganizador"));

        // ComiteCientifico <-> Avaliador
        modelBuilder.Entity<ComiteCientifico>()
            .HasMany(c => c.MembrosAvaliadores)
            .WithMany(a => a.Comites)
            .UsingEntity(j => j.ToTable("ComiteAvaliador"));

        // ComiteCientifico <-> Organizador
        modelBuilder.Entity<ComiteCientifico>()
            .HasMany(c => c.Coordenadores)
            .WithMany(o => o.ComitesCoordenados)
            .UsingEntity(j => j.ToTable("ComiteOrganizador"));

        // Configuração de índices
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Evento>()
            .HasIndex(e => e.Nome);

        modelBuilder.Entity<Submissao>()
            .HasIndex(s => s.AutorId);

        modelBuilder.Entity<Submissao>()
            .HasIndex(s => s.TrilhaTematicaId);
    }
}

