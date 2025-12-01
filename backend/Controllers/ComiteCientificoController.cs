using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComiteCientificoController : ControllerBase
    {
        private readonly ComiteCientificoService _comiteCientificoService;
        private readonly ILogger<ComiteCientificoController> _logger;

        public ComiteCientificoController(
            ComiteCientificoService comiteCientificoService,
            ILogger<ComiteCientificoController> logger)
        {
            _comiteCientificoService = comiteCientificoService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<ComiteCientificoResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
        {
            var comites = await _comiteCientificoService.GetAllAsync(cancellationToken);
            var comitesDTO = comites.Select(c => ComiteCientificoResponseDTO.ValueOf(c)).ToList();
            return Ok(comitesDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
        {
            var comite = await _comiteCientificoService.GetByIdAsync(id, cancellationToken);
            return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
        }

        [HttpPost("evento/{eventoId}")]
        [Authorize(Roles = "Organizador")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> Create(
            long eventoId,
            [FromBody] ComiteCientificoRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Organizador tentando criar comitê científico para evento {EventoId}", eventoId);

            // Extrai o ID do usuário do token
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorId))
            {
                _logger.LogWarning("ID do organizador não encontrado no token");
                return Unauthorized(new { message = "Token inválido" });
            }

            var comite = await _comiteCientificoService.CreateAsync(eventoId, organizadorId, request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = comite.Id }, ComiteCientificoResponseDTO.ValueOf(comite));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] ComiteCientificoRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            await _comiteCientificoService.UpdateAsync(id, request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
        {
            await _comiteCientificoService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }

        [HttpPost("{comiteId}/avaliadores/{emailAvaliador}")]
        [Authorize(Roles = "Organizador")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> AddAvaliador(
            long comiteId,
            string emailAvaliador,
            CancellationToken cancellationToken = default)
        {
            var comite = await _comiteCientificoService.AddAvaliadorAsync(comiteId, emailAvaliador, cancellationToken);
            return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
        }

        [HttpDelete("{comiteId}/avaliadores/{avaliadorId}")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> RemoveAvaliador(
            long comiteId,
            long avaliadorId,
            CancellationToken cancellationToken = default)
        {
            var comite = await _comiteCientificoService.RemoveAvaliadorAsync(comiteId, avaliadorId, cancellationToken);
            return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
        }

        [HttpPost("{comiteId}/coordenadores/{emailOrganizador}")]
        [Authorize(Roles = "Organizador")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> AddCoordenador(
            long comiteId,
            string emailOrganizador,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Organizador tentando adicionar coordenador {EmailOrganizador} ao comitê {ComiteId}", emailOrganizador, comiteId);

            // Extrai o ID do usuário do token para validar permissões
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorAutenticadoId))
            {
                _logger.LogWarning("ID do organizador não encontrado no token");
                return Unauthorized(new { message = "Token inválido" });
            }

            var comite = await _comiteCientificoService.AddCoordenadorAsync(comiteId, emailOrganizador, cancellationToken);
            return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
        }

        [HttpDelete("{comiteId}/coordenadores/{organizadorId}")]
        [Authorize(Roles = "Organizador")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> RemoveCoordenador(
            long comiteId,
            long organizadorId,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Organizador tentando remover coordenador {OrganizadorId} do comitê {ComiteId}", organizadorId, comiteId);

            // Extrai o ID do usuário do token para validar permissões
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long organizadorAutenticadoId))
            {
                _logger.LogWarning("ID do organizador não encontrado no token");
                return Unauthorized(new { message = "Token inválido" });
            }

            var comite = await _comiteCientificoService.RemoveCoordenadorAsync(comiteId, organizadorId, cancellationToken);
            return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
        }
    }
}

