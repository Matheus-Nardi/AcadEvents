using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvaliadorController : ControllerBase
    {
        private readonly AvaliadorService _avaliadorService;
        private readonly ILogger<AvaliadorController> _logger;

        public AvaliadorController(
            AvaliadorService avaliadorService,
            ILogger<AvaliadorController> logger)
        {
            _avaliadorService = avaliadorService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<AvaliadorResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
        {
            var avaliadores = await _avaliadorService.GetAllAsync(cancellationToken);
            var avaliadoresDTO = avaliadores.Select(a => AvaliadorResponseDTO.ValueOf(a)).ToList();
            return Ok(avaliadoresDTO);
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<AvaliadorResponseDTO>> GetByEmail(string email, CancellationToken cancellationToken = default)
        {
            var avaliador = await _avaliadorService.GetByEmailAsync(email, cancellationToken);
            if (avaliador == null)
                return NotFound($"Avaliador com email {email} não encontrado.");

            return Ok(AvaliadorResponseDTO.ValueOf(avaliador));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AvaliadorResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
        {
            var avaliador = await _avaliadorService.GetByIdAsync(id, cancellationToken);
            if (avaliador == null)
                return NotFound($"Avaliador com Id {id} não encontrado.");

            return Ok(AvaliadorResponseDTO.ValueOf(avaliador));
        }

        [HttpPost]
        [Authorize(Roles = "Avaliador")]
        public async Task<ActionResult<AvaliadorResponseDTO>> Create(
            [FromBody] AvaliadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Avaliador tentando criar novo avaliador");

            // Extrai o ID do usuário do token
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long avaliadorId))
            {
                _logger.LogWarning("ID do avaliador não encontrado no token");
                return Unauthorized(new { message = "Token inválido" });
            }

            try
            {
                var avaliador = await _avaliadorService.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = avaliador.Id }, AvaliadorResponseDTO.ValueOf(avaliador));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro ao criar avaliador para usuário {AvaliadorId}", avaliadorId);
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Avaliador")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] AvaliadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Avaliador tentando atualizar avaliador com Id {AvaliadorId}", id);

            // Extrai o ID do usuário do token
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long avaliadorAutenticadoId))
            {
                _logger.LogWarning("ID do avaliador não encontrado no token");
                return Unauthorized(new { message = "Token inválido" });
            }

            try
            {
                var avaliador = await _avaliadorService.UpdateAsync(id, request, cancellationToken);
                if (avaliador == null)
                    return NotFound($"Avaliador com Id {id} não encontrado.");

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro ao atualizar avaliador {AvaliadorId}", id);
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Avaliador")]
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Avaliador tentando deletar avaliador com Id {AvaliadorId}", id);

            // Extrai o ID do usuário do token
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long avaliadorAutenticadoId))
            {
                _logger.LogWarning("ID do avaliador não encontrado no token");
                return Unauthorized(new { message = "Token inválido" });
            }

            try
            {
                var deletado = await _avaliadorService.DeleteAsync(id, cancellationToken);
                if (!deletado)
                    return NotFound($"Avaliador com Id {id} não encontrado.");

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro ao deletar avaliador {AvaliadorId}", id);
                return BadRequest(ex.Message);
            }
        }
    }
}

