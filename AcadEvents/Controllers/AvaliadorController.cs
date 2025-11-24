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
        public async Task<ActionResult<AvaliadorResponseDTO>> Create(
            [FromBody] AvaliadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Criando novo avaliador");

            try
            {
                var avaliador = await _avaliadorService.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = avaliador.Id }, AvaliadorResponseDTO.ValueOf(avaliador));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro ao criar avaliador");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] AvaliadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Atualizando avaliador com Id {AvaliadorId}", id);

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
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Deletando avaliador com Id {AvaliadorId}", id);

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

