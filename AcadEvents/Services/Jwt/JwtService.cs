using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using AcadEvents.Models;

namespace AcadEvents.Services.Jwt;
public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }
    public string GenerateToken(Usuario user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key não configurada")));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Claims são as informações que você quer guardar no token
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.Nome)
        };

        // Adiciona roles baseadas no tipo do usuário
        if (user is Autor)
        {
            claims.Add(new Claim(ClaimTypes.Role, "Autor"));
            claims.Add(new Claim("UserType", "Autor"));
        }
        else if (user is Avaliador)
        {
            claims.Add(new Claim(ClaimTypes.Role, "Avaliador"));
            claims.Add(new Claim("UserType", "Avaliador"));
        }
        else if (user is Organizador)
        {
            claims.Add(new Claim(ClaimTypes.Role, "Organizador"));
            claims.Add(new Claim("UserType", "Organizador"));
        }
        else
        {
            claims.Add(new Claim(ClaimTypes.Role, "Usuario"));
            claims.Add(new Claim("UserType", "Usuario"));
        }

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2), // Duração do token
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}