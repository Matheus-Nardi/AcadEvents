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
            return Ok(AvaliadorResponseDTO.ValueOf(avaliador));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AvaliadorResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
        {
            var avaliador = await _avaliadorService.GetByIdAsync(id, cancellationToken);
            return Ok(AvaliadorResponseDTO.ValueOf(avaliador));
        }

        [HttpPost]
        public async Task<ActionResult<AvaliadorResponseDTO>> Create(
            [FromBody] AvaliadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Criando novo avaliador");
            var avaliador = await _avaliadorService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = avaliador.Id }, AvaliadorResponseDTO.ValueOf(avaliador));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] AvaliadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Atualizando avaliador com Id {AvaliadorId}", id);
            await _avaliadorService.UpdateAsync(id, request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Deletando avaliador com Id {AvaliadorId}", id);
            await _avaliadorService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}

