using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using AcadEvents.Services.EmailTemplates;

namespace AcadEvents.Services;

public class ComiteCientificoService
{
    private readonly ComiteCientificoRepository _comiteCientificoRepository;
    private readonly EventoRepository _eventoRepository;
    private readonly OrganizadorRepository _organizadorRepository;
    private readonly AvaliadorRepository _avaliadorRepository;
    private readonly IEmailService _emailService;
    private readonly ConviteAvaliacaoRepository _conviteAvaliacaoRepository;
    private readonly SubmissaoRepository _submissaoRepository;

    public ComiteCientificoService(
        ComiteCientificoRepository comiteCientificoRepository,
        EventoRepository eventoRepository,
        OrganizadorRepository organizadorRepository,
        AvaliadorRepository avaliadorRepository,
        IEmailService emailService,
        ConviteAvaliacaoRepository conviteAvaliacaoRepository,
        SubmissaoRepository submissaoRepository)
    {
        _comiteCientificoRepository = comiteCientificoRepository;
        _eventoRepository = eventoRepository;
        _organizadorRepository = organizadorRepository;
        _avaliadorRepository = avaliadorRepository;
        _emailService = emailService;
        _conviteAvaliacaoRepository = conviteAvaliacaoRepository;
        _submissaoRepository = submissaoRepository;
    }

    public async Task<List<ComiteCientifico>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _comiteCientificoRepository.FindAllWithRelacionamentosAsync(cancellationToken);
    }

    public async Task<ComiteCientifico?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(id, cancellationToken);
    }

    public async Task<ComiteCientifico> CreateAsync(long eventoId, long organizadorId, ComiteCientificoRequestDTO request, CancellationToken cancellationToken = default)
    {
        // Verificar se o evento existe
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        if (evento == null)
            throw new ArgumentException($"Evento com Id {eventoId} não encontrado.");

        // Verificar se o organizador existe e é organizador do evento
        var organizador = await _organizadorRepository.FindByIdAsync(organizadorId, cancellationToken);
        if (organizador == null)
            throw new ArgumentException($"Organizador com Id {organizadorId} não encontrado.");

        if (!evento.Organizadores.Contains(organizador))
            throw new ArgumentException($"O organizador com Id {organizadorId} não é organizador do evento com Id {eventoId}.");

        // Validar avaliadores se fornecidos
        var avaliadores = new List<Avaliador>();
        if (request.AvaliadoresIds != null && request.AvaliadoresIds.Any())
        {
            foreach (var avaliadorId in request.AvaliadoresIds)
            {
                var avaliador = await _avaliadorRepository.FindByIdAsync(avaliadorId, cancellationToken);
                if (avaliador == null)
                    throw new ArgumentException($"Avaliador com Id {avaliadorId} não encontrado.");

                avaliadores.Add(avaliador);
            }
        }

        // Validar coordenadores se fornecidos
        var coordenadores = new List<Organizador> { organizador }; // O criador é automaticamente coordenador
        if (request.CoordenadoresIds != null && request.CoordenadoresIds.Any())
        {
            foreach (var coordenadorId in request.CoordenadoresIds)
            {
                if (coordenadorId == organizadorId)
                    continue; // Já foi adicionado

                var coordenador = await _organizadorRepository.FindByIdAsync(coordenadorId, cancellationToken);
                if (coordenador == null)
                    throw new ArgumentException($"Organizador coordenador com Id {coordenadorId} não encontrado.");

                coordenadores.Add(coordenador);
            }
        }

        // Criar o comitê
        var comite = new ComiteCientifico
        {
            Nome = request.Nome,
            Tipo = request.Tipo,
            Descricao = request.Descricao,
            EventoId = eventoId,
            MembrosAvaliadores = avaliadores,
            Coordenadores = coordenadores
        };

        var comiteCriado = await _comiteCientificoRepository.CreateAsync(comite, cancellationToken);
        // Recarregar com relacionamentos para garantir que estão incluídos
        var comiteCompleto = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteCriado.Id, cancellationToken);
        
        // Enviar email para todos os avaliadores adicionados ao comitê
        if (comiteCompleto != null && comiteCompleto.MembrosAvaliadores.Any())
        {
            foreach (var avaliador in comiteCompleto.MembrosAvaliadores)
            {
                try
                {
                    var emailBody = EmailTemplateService.AdicionadoAoComiteCientificoTemplate(
                        avaliador.Nome,
                        organizador.Nome,
                        comiteCompleto.Nome,
                        evento.Nome,
                        comiteCompleto.Tipo,
                        comiteCompleto.Descricao);
                    
                    await _emailService.SendEmailAsync(
                        avaliador.Email,
                        $"Você foi adicionado ao Comitê Científico: {comiteCompleto.Nome}",
                        emailBody,
                        isHtml: true,
                        cancellationToken);
                }
                catch
                {
                    // Erro no envio de email não deve quebrar o fluxo principal
                }
            }
        }
        
        return comiteCompleto!;
    }

    public async Task<ComiteCientifico?> UpdateAsync(long id, ComiteCientificoRequestDTO request, CancellationToken cancellationToken = default)
    {
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(id, cancellationToken);
        if (comite == null)
            return null;

        // Atualizar propriedades básicas
        comite.Nome = request.Nome;
        comite.Tipo = request.Tipo;
        comite.Descricao = request.Descricao;

        // Atualizar avaliadores se fornecidos
        if (request.AvaliadoresIds != null)
        {
            var avaliadores = new List<Avaliador>();
            foreach (var avaliadorId in request.AvaliadoresIds)
            {
                var avaliador = await _avaliadorRepository.FindByIdAsync(avaliadorId, cancellationToken);
                if (avaliador == null)
                    throw new ArgumentException($"Avaliador com Id {avaliadorId} não encontrado.");

                avaliadores.Add(avaliador);
            }
            comite.MembrosAvaliadores = avaliadores;
        }

        // Atualizar coordenadores se fornecidos
        if (request.CoordenadoresIds != null)
        {
            var coordenadores = new List<Organizador>();
            foreach (var coordenadorId in request.CoordenadoresIds)
            {
                var coordenador = await _organizadorRepository.FindByIdAsync(coordenadorId, cancellationToken);
                if (coordenador == null)
                    throw new ArgumentException($"Organizador coordenador com Id {coordenadorId} não encontrado.");

                coordenadores.Add(coordenador);
            }
            comite.Coordenadores = coordenadores;
        }

        var comiteAtualizado = await _comiteCientificoRepository.UpdateAsync(comite, cancellationToken);
        // Recarregar com relacionamentos
        var comiteCompleto = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteAtualizado.Id, cancellationToken);
        return comiteCompleto;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _comiteCientificoRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<ComiteCientifico> AddAvaliadorAsync(long comiteId, string emailAvaliador, CancellationToken cancellationToken = default)
    {
        // Buscar avaliador por email
        var avaliador = await _avaliadorRepository.FindByEmailAsync(emailAvaliador, cancellationToken);
        if (avaliador == null)
            throw new ArgumentException($"Avaliador com email {emailAvaliador} não encontrado.");

        // Buscar comitê para validar se já está adicionado
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        if (comite == null)
            throw new ArgumentException($"Comitê Científico com Id {comiteId} não encontrado.");

        // Validar se o avaliador já está no comitê
        if (comite.MembrosAvaliadores.Any(a => a.Id == avaliador.Id))
        {
            throw new ArgumentException($"O avaliador com email {emailAvaliador} já está adicionado ao comitê.");
        }

        // Adicionar avaliador
        await _comiteCientificoRepository.AddAvaliadorAsync(comiteId, avaliador.Id, cancellationToken);
        
        // Recarregar comitê com relacionamentos
        comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        
        // Buscar evento para enviar email
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(comite.EventoId, cancellationToken);
        
        // Enviar email ao avaliador adicionado
        if (comite != null && comite.Coordenadores.Any() && evento != null)
        {
            // Usar o primeiro coordenador como organizador que adicionou
            var organizadorQueAdicionou = comite.Coordenadores.First();
            
            try
            {
                var emailBody = EmailTemplateService.AdicionadoAoComiteCientificoTemplate(
                    avaliador.Nome,
                    organizadorQueAdicionou.Nome,
                    comite.Nome,
                    evento.Nome,
                    comite.Tipo,
                    comite.Descricao);
                
                await _emailService.SendEmailAsync(
                    avaliador.Email,
                    $"Você foi adicionado ao Comitê Científico: {comite.Nome}",
                    emailBody,
                    isHtml: true,
                    cancellationToken);
            }
            catch
            {
                // Erro no envio de email não deve quebrar o fluxo principal
            }
        }

        // Criar convites automaticamente para o avaliador adicionado para todas as submissões do evento
        if (evento != null)
        {
            try
            {
                await CriarConvitesParaAvaliadorAdicionadoAsync(avaliador.Id, evento.Id, cancellationToken);
            }
            catch
            {
                // Erro na criação de convites não deve quebrar o fluxo principal
                // O avaliador já foi adicionado com sucesso
            }
        }
        
        return comite!;
    }

    public async Task<ComiteCientifico> RemoveAvaliadorAsync(long comiteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        await _comiteCientificoRepository.RemoveAvaliadorAsync(comiteId, avaliadorId, cancellationToken);
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        return comite!;
    }

    public async Task<ComiteCientifico> AddCoordenadorAsync(long comiteId, string emailOrganizador, CancellationToken cancellationToken = default)
    {
        // Buscar organizador por email
        var organizador = await _organizadorRepository.FindByEmailAsync(emailOrganizador, cancellationToken);
        if (organizador == null)
            throw new ArgumentException($"Organizador com email {emailOrganizador} não encontrado.");

        // Buscar comitê para validar se já está adicionado
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        if (comite == null)
            throw new ArgumentException($"Comitê Científico com Id {comiteId} não encontrado.");

        // Validar se o organizador já está no comitê
        if (comite.Coordenadores.Any(o => o.Id == organizador.Id))
        {
            throw new ArgumentException($"O organizador com email {emailOrganizador} já está adicionado ao comitê.");
        }

        // Adicionar coordenador
        await _comiteCientificoRepository.AddCoordenadorAsync(comiteId, organizador.Id, cancellationToken);
        
        // Recarregar comitê com relacionamentos
        comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        return comite!;
    }

    public async Task<ComiteCientifico> RemoveCoordenadorAsync(long comiteId, long organizadorId, CancellationToken cancellationToken = default)
    {
        await _comiteCientificoRepository.RemoveCoordenadorAsync(comiteId, organizadorId, cancellationToken);
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        return comite!;
    }

    private async Task CriarConvitesParaAvaliadorAdicionadoAsync(long avaliadorId, long eventoId, CancellationToken cancellationToken = default)
    {
        // Buscar todas as submissões do evento
        var submissoes = await _submissaoRepository.FindByEventoIdAsync(eventoId, cancellationToken);
        
        if (!submissoes.Any())
            return; // Não há submissões para criar convites
        
        // Buscar configuração do evento para obter o prazo de avaliação
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        if (evento?.Configuracao == null)
            return; // Não há configuração do evento
        
        var prazoAvaliacao = evento.Configuracao.PrazoAvaliacao;
        
        // Criar convites para o avaliador para cada submissão
        var convites = new List<ConviteAvaliacao>();
        
        foreach (var submissao in submissoes)
        {
            // Verificar se já existe um convite para este avaliador e submissão
            var conviteExistente = await _conviteAvaliacaoRepository.ExisteConviteAsync(
                avaliadorId, 
                submissao.Id, 
                cancellationToken);
            
            if (!conviteExistente)
            {
                convites.Add(new ConviteAvaliacao
                {
                    DataConvite = DateTime.UtcNow,
                    PrazoAvaliacao = prazoAvaliacao,
                    AvaliadorId = avaliadorId,
                    SubmissaoId = submissao.Id,
                    Aceito = null,
                    MotivoRecusa = string.Empty,
                    DataResposta = null
                });
            }
        }
        
        // Criar todos os convites em lote
        if (convites.Any())
        {
            await _conviteAvaliacaoRepository.CreateBulkAsync(convites, cancellationToken);
        }
    }
}

