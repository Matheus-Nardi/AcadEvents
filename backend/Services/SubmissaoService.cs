using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;
using Microsoft.AspNetCore.Http;
using AcadEvents.Services.EmailTemplates;
using AcadEvents.Exceptions;

namespace AcadEvents.Services;

public class SubmissaoService
{
    private readonly SubmissaoRepository _submissaoRepository;
    private readonly AutorRepository _autorRepository;
    private readonly EventoRepository _eventoRepository;
    private readonly TrilhaTematicaRepository _trilhaTematicaRepository;
    private readonly ReferenciaService _referenciaService;
    private readonly ArquivoSubmissaoService _arquivoSubmissaoService;
    private readonly IEmailService _emailService;
    private readonly ConviteAvaliacaoRepository _conviteAvaliacaoRepository;
    private readonly ComiteCientificoRepository _comiteCientificoRepository;
    private readonly AvaliacaoRepository _avaliacaoRepository;
    private readonly OrganizadorRepository _organizadorRepository;
    
    public SubmissaoService(
        SubmissaoRepository submissaoRepository,
        AutorRepository autorRepository,
        EventoRepository eventoRepository,
        TrilhaTematicaRepository trilhaTematicaRepository,
        ReferenciaService referenciaService,
        ArquivoSubmissaoService arquivoSubmissaoService,
        IEmailService emailService,
        ConviteAvaliacaoRepository conviteAvaliacaoRepository,
        ComiteCientificoRepository comiteCientificoRepository,
        AvaliacaoRepository avaliacaoRepository,
        OrganizadorRepository organizadorRepository)
    {
        _submissaoRepository = submissaoRepository;
        _autorRepository = autorRepository;
        _eventoRepository = eventoRepository;
        _trilhaTematicaRepository = trilhaTematicaRepository;
        _referenciaService = referenciaService;
        _arquivoSubmissaoService = arquivoSubmissaoService;
        _emailService = emailService;
        _conviteAvaliacaoRepository = conviteAvaliacaoRepository;
        _comiteCientificoRepository = comiteCientificoRepository;
        _avaliacaoRepository = avaliacaoRepository;
        _organizadorRepository = organizadorRepository;
    }

    public Task<List<Submissao>> GetAllAsync(CancellationToken cancellationToken = default)
        => _submissaoRepository.FindAllAsync(cancellationToken);

    public async Task<Submissao> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var submissao = await _submissaoRepository.FindByIdAsync(id, cancellationToken);
        if (submissao == null)
            throw new NotFoundException("Submissão", id);
        return submissao;
    }

    public async Task<List<Submissao>> GetByTrilhaTematicaIdAsync(long trilhaTematicaId, CancellationToken cancellationToken = default)
    {
        // Validar que a trilha temática existe
        if (!await _trilhaTematicaRepository.ExistsAsync(trilhaTematicaId, cancellationToken))
        {
            throw new NotFoundException("Trilha temática", trilhaTematicaId);
        }

        return await _submissaoRepository.FindByTrilhaTematicaIdAsync(trilhaTematicaId, cancellationToken);
    }

    public async Task<List<Submissao>> GetByAutorIdAsync(long autorId, CancellationToken cancellationToken = default)
    {
        // Validar que o autor existe
        if (!await _autorRepository.ExistsAsync(autorId, cancellationToken))
        {
            throw new NotFoundException("Autor", autorId);
        }

        return await _submissaoRepository.FindByAutorIdAsync(autorId, cancellationToken);
    }

    public async Task<Submissao> CreateAsync(SubmissaoRequestDTO request, long autorId, CancellationToken cancellationToken = default)
    {
        await ValidateReferencesAsync(request, autorId, cancellationToken);

        var submissao = MapToEntity(new Submissao(), request, autorId);
        var submissaoCriada = await _submissaoRepository.CreateAsync(submissao, cancellationToken);
        
        // Criar convites automaticamente para os avaliadores dos comitês do evento
        try
        {
            await CriarConvitesParaSubmissaoAsync(submissaoCriada.Id, request.EventoId, cancellationToken);
        }
        catch
        {
            // Erro na criação de convites não deve quebrar o fluxo principal
            // A submissão já foi criada com sucesso
        }
        
        return submissaoCriada;
    }

    public async Task<Submissao> UpdateAsync(long id, SubmissaoRequestDTO request, CancellationToken cancellationToken = default)
    {
        var submissao = await _submissaoRepository.FindByIdWithRelacionamentosAsync(id, cancellationToken);
        if (submissao is null)
        {
            throw new NotFoundException("Submissão", id);
        }

        // No update, mantemos o autor original (ou pode extrair do token se necessário)
        await ValidateReferencesAsync(request, submissao.AutorId, cancellationToken);

        MapToEntity(submissao, request, submissao.AutorId);
        await _submissaoRepository.UpdateAsync(submissao, cancellationToken);

        // Enviar email ao autor se a submissão foi atualizada
        if (submissao.Autor != null)
        {
            try
            {
                var emailBody = EmailTemplateService.AtualizacaoSubmissaoTemplate(
                    submissao.Autor.Nome,
                    submissao.Titulo,
                    submissao.Status.ToString(),
                    submissao.DataUltimaModificacao);
                
                await _emailService.SendEmailAsync(
                    submissao.Autor.Email,
                    $"Atualização da Submissão: {submissao.Titulo}",
                    emailBody,
                    isHtml: true,
                    cancellationToken);
            }
            catch
            {
                // Erro no envio de email não deve quebrar o fluxo principal
            }
        }

        return submissao;
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var submissao = await _submissaoRepository.FindByIdAsync(id, cancellationToken);
        if (submissao == null)
            throw new NotFoundException("Submissão", id);
            
        await _submissaoRepository.DeleteAsync(id, cancellationToken);
    }

    private Submissao MapToEntity(Submissao entity, SubmissaoRequestDTO request, long autorId)
    {
        entity.Titulo = request.Titulo;
        entity.Resumo = request.Resumo;
        entity.PalavrasChave = request.PalavrasChave ?? new List<string>();
        entity.DataSubmissao = request.DataSubmissao;
        entity.DataUltimaModificacao = request.DataUltimaModificacao;
        entity.Versao = request.Versao;
        entity.Status = request.Status;
        entity.Formato = request.Formato;
        entity.AutorId = autorId;
        entity.EventoId = request.EventoId;
        entity.TrilhaTematicaId = request.TrilhaTematicaId;
        // SessaoId e DOIId não são mais definidos na criação
        // entity.SessaoId = null;
        // entity.DOIId = null;
        return entity;
    }

    private async Task ValidateReferencesAsync(SubmissaoRequestDTO request, long autorId, CancellationToken cancellationToken)
    {

        // 1. Validar Autor
        if (!await _autorRepository.ExistsAsync(autorId, cancellationToken))
        {
            throw new NotFoundException("Autor", autorId);
        }

        // 2. Validar Evento
        if (!await _eventoRepository.ExistsAsync(request.EventoId, cancellationToken))
        {
            throw new NotFoundException("Evento", request.EventoId);
        }

        // 3. Validar TrilhaTematica
        var trilhaTematica = await _trilhaTematicaRepository.FindByIdAsync(request.TrilhaTematicaId, cancellationToken);
        if (trilhaTematica == null)
        {
            throw new NotFoundException("Trilha temática", request.TrilhaTematicaId);
        }

        // Validações de SessaoId e DOIId removidas - não são mais necessárias na criação
    }

    public async Task<SubmissaoCreateCompleteResultDTO> CreateCompleteAsync(
        SubmissaoRequestDTO dadosSubmissao,
        long autorId,
        IFormFile arquivo,
        List<string>? dois,
        CancellationToken cancellationToken = default)
    {
        // 1. Criar Submissão
        var submissao = await CreateAsync(dadosSubmissao, autorId, cancellationToken);

        var referenciasCriadas = new List<Referencia>();
        var errosReferencias = new List<string>();

        // 2. Processar DOIs se fornecidos
        if (dois != null && dois.Any())
        {
            foreach (var doi in dois)
            {
                if (string.IsNullOrWhiteSpace(doi))
                    continue;

                try
                {
                    var referencia = await _referenciaService.CreateFromDoiAsync(doi, submissao.Id, cancellationToken);
                    referenciasCriadas.Add(referencia);
                }
        catch (BadRequestException ex)
        {
            errosReferencias.Add($"DOI {doi}: {ex.Message}");
        }
        catch (NotFoundException ex)
        {
            errosReferencias.Add($"DOI {doi}: {ex.Message}");
        }
                catch (Exception ex)
                {
                    errosReferencias.Add($"DOI {doi}: Erro inesperado - {ex.Message}");
                }
            }
        }

        // 3. Fazer upload do arquivo (obrigatório)
        try
        {
            await _arquivoSubmissaoService.UploadAsync(submissao.Id, arquivo, cancellationToken);
        }
        catch (BadRequestException ex)
        {
            throw new BadRequestException($"Submissão criada, mas falha ao fazer upload do arquivo: {ex.Message}");
        }

        // 4. Buscar submissão completa com relacionamentos
        var submissaoCompleta = await _submissaoRepository.FindByIdWithRelacionamentosAsync(submissao.Id, cancellationToken);
        if (submissaoCompleta == null)
        {
            throw new InvalidOperationException("Submissão criada mas não foi possível recuperá-la.");
        }

        // Nota: Os convites já foram criados automaticamente no CreateAsync

        return new SubmissaoCreateCompleteResultDTO
        {
            Submissao = SubmissaoResponseDTO.ValueOf(submissaoCompleta),
            ReferenciasCriadas = referenciasCriadas.Count,
            ErrosReferencias = errosReferencias
        };
    }

    public async Task<List<Submissao>> GetForAvaliadorAvaliacaoAsync(long avaliadorId, CancellationToken cancellationToken = default)
    {
        return await _submissaoRepository.FindForAvaliadorAvaliacaoAsync(avaliadorId, cancellationToken);
    }

    public async Task<bool> ValidarAvaliacoesCompletasAsync(long submissaoId, CancellationToken cancellationToken = default)
    {
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(submissaoId, cancellationToken);
        if (submissao?.Evento?.Configuracao == null)
            return false;
        
        var numeroRequerido = submissao.Evento.Configuracao.NumeroAvaliadoresPorSubmissao;
        
        // Contar avaliações completas para esta submissão
        var numeroAvaliacoes = await _avaliacaoRepository.CountAvaliacoesCompletasPorSubmissaoAsync(submissaoId, cancellationToken);
        
        // Validar se tem pelo menos o número mínimo requerido
        return numeroAvaliacoes >= numeroRequerido;
    }

    private async Task CriarConvitesParaSubmissaoAsync(long submissaoId, long eventoId, CancellationToken cancellationToken = default)
    {
        // Buscar configuração do evento para obter o prazo de avaliação e número de avaliadores
        var evento = await _eventoRepository.FindByIdWithOrganizadoresAsync(eventoId, cancellationToken);
        if (evento?.Configuracao == null)
            return; // Não há configuração do evento
        
        var prazoAvaliacao = evento.Configuracao.PrazoAvaliacao;
        var numeroRequerido = evento.Configuracao.NumeroAvaliadoresPorSubmissao;
        
        // Buscar todos os avaliadores dos comitês científicos do evento
        var avaliadores = await _comiteCientificoRepository.FindAvaliadoresDoComiteDoEventoAsync(eventoId, cancellationToken);
        
        if (!avaliadores.Any())
            return; // Não há avaliadores no comitê do evento
        
        // Filtrar avaliadores que já receberam convite para esta submissão
        var avaliadoresDisponiveis = new List<Avaliador>();
        foreach (var avaliador in avaliadores)
        {
            var conviteExistente = await _conviteAvaliacaoRepository.ExisteConviteAsync(
                avaliador.Id, 
                submissaoId, 
                cancellationToken);
            
            if (!conviteExistente)
            {
                avaliadoresDisponiveis.Add(avaliador);
            }
        }
        
        // Validar se há avaliadores suficientes no comitê
        if (avaliadoresDisponiveis.Count < numeroRequerido)
        {
            throw new BusinessRuleException(
                $"Não há avaliadores suficientes no comitê científico. " +
                $"Requerido: {numeroRequerido}, Disponíveis: {avaliadoresDisponiveis.Count}. " +
                $"Adicione mais avaliadores ao comitê ou ajuste a configuração do evento.");
        }
        
        // Selecionar aleatoriamente o número requerido de avaliadores
        var random = new Random();
        var avaliadoresSelecionados = avaliadoresDisponiveis
            .OrderBy(x => random.Next())
            .Take(numeroRequerido)
            .ToList();
        
        // Criar convites apenas para os avaliadores selecionados
        var convites = avaliadoresSelecionados.Select(avaliador => new ConviteAvaliacao
        {
            DataConvite = DateTime.UtcNow,
            PrazoAvaliacao = prazoAvaliacao,
            AvaliadorId = avaliador.Id,
            SubmissaoId = submissaoId,
            Aceito = null,
            MotivoRecusa = string.Empty,
            DataResposta = null
        }).ToList();
        
        // Criar todos os convites em lote
        if (convites.Any())
        {
            await _conviteAvaliacaoRepository.CreateBulkAsync(convites, cancellationToken);
        }
    }

    /// <summary>
    /// Permite que um organizador coordenador do comitê científico decida o status final de uma submissão em revisão.
    /// O organizadorId deve ser extraído do token JWT no controller.
    /// </summary>
    public async Task<Submissao> DecidirStatusRevisaoAsync(
        long submissaoId, 
        long organizadorId, // Extraído do token JWT no controller
        DecidirStatusRevisaoRequestDTO request, 
        CancellationToken cancellationToken = default)
    {
        var submissao = await _submissaoRepository.FindByIdWithEventoAsync(submissaoId, cancellationToken);
        if (submissao == null)
            throw new NotFoundException("Submissão", submissaoId);

        // Verificar se está em revisão
        if (submissao.Status != StatusSubmissao.EM_REVISÃO)
            throw new BusinessRuleException("A submissão não está em estado de revisão.");

        // Verificar se o organizador existe (organizadorId vem do token JWT)
        var organizador = await _organizadorRepository.FindByIdAsync(organizadorId, cancellationToken);
        if (organizador == null)
            throw new NotFoundException("Organizador", organizadorId);

        // Verificar se o organizador é coordenador do comitê do evento
        var eventoId = submissao.EventoId;
        var comites = await _comiteCientificoRepository.FindAllWithRelacionamentosAsync(cancellationToken);
        var comiteDoEvento = comites.FirstOrDefault(c => c.EventoId == eventoId);
        
        if (comiteDoEvento == null || !comiteDoEvento.Coordenadores.Any(co => co.Id == organizadorId))
            throw new ForbiddenException("O organizador não é coordenador do comitê científico do evento.");

        // Validar que o novo status é válido (apenas APROVADA ou REJEITADA)
        if (request.Status != StatusSubmissao.APROVADA && request.Status != StatusSubmissao.REJEITADA)
            throw new BadRequestException("O status final deve ser APROVADA ou REJEITADA.");

        submissao.Status = request.Status;
        return await _submissaoRepository.UpdateAsync(submissao, cancellationToken);
    }
}


