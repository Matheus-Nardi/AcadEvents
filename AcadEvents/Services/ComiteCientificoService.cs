using AcadEvents.Dtos;
using AcadEvents.Models;
using AcadEvents.Repositories;

namespace AcadEvents.Services;

public class ComiteCientificoService
{
    private readonly ComiteCientificoRepository _comiteCientificoRepository;
    private readonly EventoRepository _eventoRepository;
    private readonly OrganizadorRepository _organizadorRepository;
    private readonly AvaliadorRepository _avaliadorRepository;

    public ComiteCientificoService(
        ComiteCientificoRepository comiteCientificoRepository,
        EventoRepository eventoRepository,
        OrganizadorRepository organizadorRepository,
        AvaliadorRepository avaliadorRepository)
    {
        _comiteCientificoRepository = comiteCientificoRepository;
        _eventoRepository = eventoRepository;
        _organizadorRepository = organizadorRepository;
        _avaliadorRepository = avaliadorRepository;
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

    public async Task<ComiteCientifico> AddAvaliadorAsync(long comiteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        await _comiteCientificoRepository.AddAvaliadorAsync(comiteId, avaliadorId, cancellationToken);
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        return comite!;
    }

    public async Task<ComiteCientifico> RemoveAvaliadorAsync(long comiteId, long avaliadorId, CancellationToken cancellationToken = default)
    {
        await _comiteCientificoRepository.RemoveAvaliadorAsync(comiteId, avaliadorId, cancellationToken);
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        return comite!;
    }

    public async Task<ComiteCientifico> AddCoordenadorAsync(long comiteId, long organizadorId, CancellationToken cancellationToken = default)
    {
        await _comiteCientificoRepository.AddCoordenadorAsync(comiteId, organizadorId, cancellationToken);
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        return comite!;
    }

    public async Task<ComiteCientifico> RemoveCoordenadorAsync(long comiteId, long organizadorId, CancellationToken cancellationToken = default)
    {
        await _comiteCientificoRepository.RemoveCoordenadorAsync(comiteId, organizadorId, cancellationToken);
        var comite = await _comiteCientificoRepository.FindByIdWithRelacionamentosAsync(comiteId, cancellationToken);
        return comite!;
    }
}

