using Microsoft.AspNetCore.Mvc;
using AcadEvents.Dtos;
using AcadEvents.Services;

namespace AcadEvents.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizadorController : ControllerBase
    {
        private readonly OrganizadorService _organizadorService;

        public OrganizadorController(OrganizadorService organizadorService)
        {
            _organizadorService = organizadorService;
        }

        [HttpGet]
        public async Task<ActionResult<List<OrganizadorResponseDTO>>> GetAll(CancellationToken cancellationToken = default)
        {
            var organizadores = await _organizadorService.GetAllAsync(cancellationToken);
            var organizadoresDTO = organizadores.Select(o => OrganizadorResponseDTO.ValueOf(o)).ToList();
            return Ok(organizadoresDTO);
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<OrganizadorResponseDTO>> GetByEmail(string email, CancellationToken cancellationToken = default)
        {
            var organizador = await _organizadorService.GetByEmailAsync(email, cancellationToken);
            if (organizador == null)
                return NotFound($"Organizador com email {email} não encontrado.");

            return Ok(OrganizadorResponseDTO.ValueOf(organizador));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrganizadorResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
        {
            var organizador = await _organizadorService.GetByIdAsync(id, cancellationToken);
            if (organizador == null)
                return NotFound($"Organizador com Id {id} não encontrado.");

            return Ok(OrganizadorResponseDTO.ValueOf(organizador));
        }

        [HttpPost]
        public async Task<ActionResult<OrganizadorResponseDTO>> Create(
            [FromBody] OrganizadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var organizador = await _organizadorService.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = organizador.Id }, OrganizadorResponseDTO.ValueOf(organizador));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] OrganizadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var organizador = await _organizadorService.UpdateAsync(id, request, cancellationToken);
                if (organizador == null)
                    return NotFound($"Organizador com Id {id} não encontrado.");

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
            var deletado = await _organizadorService.DeleteAsync(id, cancellationToken);
            if (!deletado)
                return NotFound($"Organizador com Id {id} não encontrado.");

            return NoContent();
        }
    }
}

