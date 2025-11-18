using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrilhaController : ControllerBase
    {
        private readonly TrilhaService _trilhaService;

        public TrilhaController(TrilhaService trilhaService)
        {
            _trilhaService = trilhaService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TrilhaResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
        {
            var trilhas = await _trilhaService.GetAllAsync(cancellationToken);
            var trilhasDTO = trilhas.Select(t => TrilhaResponseDTO.ValueOf(t)).ToList();
            return Ok(trilhasDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TrilhaResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
        {
            var trilha = await _trilhaService.GetByIdAsync(id, cancellationToken);
            if (trilha == null)
                return NotFound($"Trilha com Id {id} não encontrada.");

            return Ok(TrilhaResponseDTO.ValueOf(trilha));
        }

        [HttpPost("evento/{eventoId}")]
        public async Task<ActionResult<TrilhaResponseDTO>> Create(
            long eventoId,
            [FromBody] TrilhaRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var trilha = await _trilhaService.CreateAsync(eventoId, request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = trilha.Id }, TrilhaResponseDTO.ValueOf(trilha));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] TrilhaRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var trilha = await _trilhaService.UpdateAsync(id, request, cancellationToken);
                if (trilha == null)
                    return NotFound($"Trilha com Id {id} não encontrada.");

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
        {
            var deletado = await _trilhaService.DeleteAsync(id, cancellationToken);
            if (!deletado)
                return NotFound($"Trilha com Id {id} não encontrada.");

            return NoContent();
        }
    }
}

