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
            return Ok(OrganizadorResponseDTO.ValueOf(organizador));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrganizadorResponseDTO>> GetById(long id, CancellationToken cancellationToken = default)
        {
            var organizador = await _organizadorService.GetByIdAsync(id, cancellationToken);
            return Ok(OrganizadorResponseDTO.ValueOf(organizador));
        }

        [HttpPost]
        public async Task<ActionResult<OrganizadorResponseDTO>> Create(
            [FromBody] OrganizadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            var organizador = await _organizadorService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = organizador.Id }, OrganizadorResponseDTO.ValueOf(organizador));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] OrganizadorRequestDTO request,
            CancellationToken cancellationToken = default)
        {
            await _organizadorService.UpdateAsync(id, request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken = default)
        {
            await _organizadorService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}

