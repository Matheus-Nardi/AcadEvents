using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComiteCientificoController : ControllerBase
    {
        private readonly ComiteCientificoService _comiteCientificoService;

        public ComiteCientificoController(ComiteCientificoService comiteCientificoService)
        {
            _comiteCientificoService = comiteCientificoService;
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
            if (comite == null)
                return NotFound($"Comitê Científico com Id {id} não encontrado.");

            return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
        }

        [HttpPost("evento/{eventoId}/organizador/{organizadorId}")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> Create(
            long eventoId,
            long organizadorId,
            [FromBody] ComiteCientificoRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var comite = await _comiteCientificoService.CreateAsync(eventoId, organizadorId, request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = comite.Id }, ComiteCientificoResponseDTO.ValueOf(comite));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] ComiteCientificoRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var comite = await _comiteCientificoService.UpdateAsync(id, request, cancellationToken);
                if (comite == null)
                    return NotFound($"Comitê Científico com Id {id} não encontrado.");

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
            var deletado = await _comiteCientificoService.DeleteAsync(id, cancellationToken);
            if (!deletado)
                return NotFound($"Comitê Científico com Id {id} não encontrado.");

            return NoContent();
        }

        [HttpPost("{comiteId}/avaliadores/{avaliadorId}")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> AddAvaliador(
            long comiteId,
            long avaliadorId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var comite = await _comiteCientificoService.AddAvaliadorAsync(comiteId, avaliadorId, cancellationToken);
                return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{comiteId}/avaliadores/{avaliadorId}")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> RemoveAvaliador(
            long comiteId,
            long avaliadorId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var comite = await _comiteCientificoService.RemoveAvaliadorAsync(comiteId, avaliadorId, cancellationToken);
                return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{comiteId}/coordenadores/{organizadorId}")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> AddCoordenador(
            long comiteId,
            long organizadorId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var comite = await _comiteCientificoService.AddCoordenadorAsync(comiteId, organizadorId, cancellationToken);
                return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{comiteId}/coordenadores/{organizadorId}")]
        public async Task<ActionResult<ComiteCientificoResponseDTO>> RemoveCoordenador(
            long comiteId,
            long organizadorId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var comite = await _comiteCientificoService.RemoveCoordenadorAsync(comiteId, organizadorId, cancellationToken);
                return Ok(ComiteCientificoResponseDTO.ValueOf(comite));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

