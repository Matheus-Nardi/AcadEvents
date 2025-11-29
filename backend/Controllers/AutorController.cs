using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutorController : ControllerBase
    {
        private readonly AutorService _autorService;

        public AutorController(AutorService autorService)
        {
            _autorService = autorService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AutorResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
        {
            var autores = await _autorService.GetAllAsync(cancellationToken);
            var autoresDTO = autores.Select(a => AutorResponseDTO.ValueOf(a)).ToList();
            return Ok(autoresDTO);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AutorResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
        {
            var autor = await _autorService.GetByIdAsync(id, cancellationToken);
            if (autor == null)
                return NotFound($"Autor com Id {id} não encontrado.");

            return Ok(AutorResponseDTO.ValueOf(autor));
        }

        [HttpPost]
        public async Task<ActionResult<AutorResponseDTO>> Create(
            [FromBody] AutorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var autor = await _autorService.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = autor.Id }, AutorResponseDTO.ValueOf(autor));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] AutorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var autor = await _autorService.UpdateAsync(id, request, cancellationToken);
                if (autor == null)
                    return NotFound($"Autor com Id {id} não encontrado.");

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
            var deletado = await _autorService.DeleteAsync(id, cancellationToken);
            if (!deletado)
                return NotFound($"Autor com Id {id} não encontrado.");

            return NoContent();
        }
    }
}

