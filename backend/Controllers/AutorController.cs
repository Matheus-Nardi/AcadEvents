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
            return Ok(AutorResponseDTO.ValueOf(autor));
        }

        [HttpPost]
        public async Task<ActionResult<AutorResponseDTO>> Create(
            [FromBody] AutorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            var autor = await _autorService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = autor.Id }, AutorResponseDTO.ValueOf(autor));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] AutorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            await _autorService.UpdateAsync(id, request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
        {
            await _autorService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}

