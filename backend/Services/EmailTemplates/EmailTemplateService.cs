namespace AcadEvents.Services.EmailTemplates;

public static class EmailTemplateService
{
    public static string RegistroUsuarioTemplate(string nome, string tipoUsuario)
    {
        return $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Bem-vindo ao AcadEvents</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #2c3e50;
            margin: 0;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .footer {{
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Bem-vindo ao AcadEvents!</h1>
        </div>
        <div class=""content"">
            <p>Olá <strong>{nome}</strong>,</p>
            <p>É um prazer tê-lo(a) conosco! Seu cadastro como <strong>{tipoUsuario}</strong> foi realizado com sucesso na plataforma AcadEvents.</p>
            <p>Agora você pode:</p>
            <ul>
                <li>Acessar sua conta e explorar os eventos disponíveis</li>
                <li>Participar de submissões e avaliações</li>
                <li>Gerenciar seu perfil acadêmico</li>
            </ul>
            <p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato conosco.</p>
            <p>Bem-vindo(a) e boa sorte em suas atividades acadêmicas!</p>
        </div>
        <div class=""footer"">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; {DateTime.Now.Year} AcadEvents - Plataforma de Eventos Acadêmicos</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string AtualizacaoSubmissaoTemplate(string nomeAutor, string tituloSubmissao, string status, DateTime dataAtualizacao)
    {
        var statusFormatado = status switch
        {
            "SUBMETIDA" => "Submetida",
            "EM_AVALIACAO" => "Em Avaliação",
            "APROVADA" => "Aprovada",
            "APROVADA_COM_RESSALVAS" => "Aprovada com Ressalvas",
            "REJEITADA" => "Rejeitada",
            _ => status
        };

        return $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Atualização de Submissão - AcadEvents</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #2c3e50;
            margin: 0;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .status-box {{
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }}
        .status-box strong {{
            color: #2c3e50;
        }}
        .footer {{
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Atualização de Submissão</h1>
        </div>
        <div class=""content"">
            <p>Olá <strong>{nomeAutor}</strong>,</p>
            <p>Informamos que sua submissão foi atualizada na plataforma AcadEvents.</p>
            <div class=""status-box"">
                <p><strong>Título:</strong> {tituloSubmissao}</p>
                <p><strong>Status:</strong> {statusFormatado}</p>
                <p><strong>Data da Atualização:</strong> {dataAtualizacao:dd/MM/yyyy HH:mm}</p>
            </div>
            <p>Você pode acessar sua conta para visualizar mais detalhes sobre a atualização.</p>
            <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
        </div>
        <div class=""footer"">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; {DateTime.Now.Year} AcadEvents - Plataforma de Eventos Acadêmicos</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string EventoCriadoTemplate(
        string nomeOrganizador,
        string nomeEvento,
        string descricaoEvento,
        DateTime dataInicio,
        DateTime dataFim,
        string local,
        DateTime prazoSubmissao,
        DateTime prazoAvaliacao,
        int numeroAvaliadoresPorSubmissao,
        bool avaliacaoDuploCego,
        bool permiteResubmissao)
    {
        var avaliacaoDuploCegoTexto = avaliacaoDuploCego ? "Sim" : "Não";
        var permiteResubmissaoTexto = permiteResubmissao ? "Sim" : "Não";

        return $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Novo Evento Criado - AcadEvents</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #2c3e50;
            margin: 0;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .evento-box {{
            background-color: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }}
        .evento-box h2 {{
            color: #2c3e50;
            margin-top: 0;
        }}
        .info-row {{
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #bdc3c7;
        }}
        .info-row:last-child {{
            border-bottom: none;
        }}
        .info-label {{
            font-weight: bold;
            color: #2c3e50;
            display: inline-block;
            width: 180px;
        }}
        .info-value {{
            color: #34495e;
        }}
        .prazo-box {{
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }}
        .prazo-box h3 {{
            color: #856404;
            margin-top: 0;
        }}
        .footer {{
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Novo Evento Criado</h1>
        </div>
        <div class=""content"">
            <p>Olá <strong>{nomeOrganizador}</strong>,</p>
            <p>Informamos que um novo evento foi criado na plataforma AcadEvents.</p>
            
            <div class=""evento-box"">
                <h2>{nomeEvento}</h2>
                <p>{descricaoEvento}</p>
                
                <div class=""info-row"">
                    <span class=""info-label"">Data de Início:</span>
                    <span class=""info-value"">{dataInicio:dd/MM/yyyy HH:mm}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Data de Término:</span>
                    <span class=""info-value"">{dataFim:dd/MM/yyyy HH:mm}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Local:</span>
                    <span class=""info-value"">{local}</span>
                </div>
            </div>

            <div class=""prazo-box"">
                <h3>⚠️ Prazos Importantes</h3>
                <div class=""info-row"">
                    <span class=""info-label"">Prazo para Submissão:</span>
                    <span class=""info-value""><strong>{prazoSubmissao:dd/MM/yyyy HH:mm}</strong></span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Prazo para Avaliação:</span>
                    <span class=""info-value""><strong>{prazoAvaliacao:dd/MM/yyyy HH:mm}</strong></span>
                </div>
            </div>

            <div class=""evento-box"">
                <h3>Configurações do Evento</h3>
                <div class=""info-row"">
                    <span class=""info-label"">Avaliadores por Submissão:</span>
                    <span class=""info-value"">{numeroAvaliadoresPorSubmissao}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Avaliação Duplo Cego:</span>
                    <span class=""info-value"">{avaliacaoDuploCegoTexto}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Permite Resubmissão:</span>
                    <span class=""info-value"">{permiteResubmissaoTexto}</span>
                </div>
            </div>

            <p><strong>Lembre-se:</strong> É importante acompanhar os prazos de submissão e avaliação para garantir o sucesso do evento.</p>
            <p>Você pode acessar a plataforma para gerenciar o evento e visualizar mais detalhes.</p>
            <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
        </div>
        <div class=""footer"">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; {DateTime.Now.Year} AcadEvents - Plataforma de Eventos Acadêmicos</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string AdicionadoAoComiteCientificoTemplate(
        string nomeAvaliador,
        string nomeOrganizador,
        string nomeComite,
        string nomeEvento,
        string tipoComite,
        string descricaoComite)
    {
        return $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Adicionado ao Comitê Científico - AcadEvents</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #2c3e50;
            margin: 0;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .info-box {{
            background-color: #e8f5e9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
        }}
        .info-box h2 {{
            color: #2c3e50;
            margin-top: 0;
        }}
        .info-row {{
            margin: 10px 0;
            padding: 8px 0;
        }}
        .info-label {{
            font-weight: bold;
            color: #2c3e50;
            display: inline-block;
            width: 150px;
        }}
        .info-value {{
            color: #34495e;
        }}
        .highlight {{
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }}
        .footer {{
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Adicionado ao Comitê Científico</h1>
        </div>
        <div class=""content"">
            <p>Olá <strong>{nomeAvaliador}</strong>,</p>
            <p>Informamos que o organizador <strong>{nomeOrganizador}</strong> te adicionou ao comitê científico do evento <strong>{nomeEvento}</strong>.</p>
            
            <div class=""info-box"">
                <h2>{nomeComite}</h2>
                <div class=""info-row"">
                    <span class=""info-label"">Tipo:</span>
                    <span class=""info-value"">{tipoComite}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Evento:</span>
                    <span class=""info-value"">{nomeEvento}</span>
                </div>
                {(!string.IsNullOrWhiteSpace(descricaoComite) ? $@"
                <div class=""info-row"">
                    <span class=""info-label"">Descrição:</span>
                    <span class=""info-value"">{descricaoComite}</span>
                </div>
                " : "")}
            </div>

            <div class=""highlight"">
                <p><strong>Parabéns!</strong> Como membro do comitê científico, você terá acesso a:</p>
                <ul>
                    <li>Avaliar submissões do evento</li>
                    <li>Participar das decisões do comitê</li>
                    <li>Contribuir para a qualidade científica do evento</li>
                </ul>
            </div>

            <p>Você pode acessar a plataforma para visualizar mais detalhes sobre o comitê e começar a avaliar submissões.</p>
            <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
        </div>
        <div class=""footer"">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; {DateTime.Now.Year} AcadEvents - Plataforma de Eventos Acadêmicos</p>
        </div>
    </div>
</body>
</html>";
    }
}

