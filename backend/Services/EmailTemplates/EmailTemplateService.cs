namespace AcadEvents.Services.EmailTemplates;

public static class EmailTemplateService
{
    public static string RegistroUsuarioTemplate(string nome, string tipoUsuario)
    {
        var (titulo, descricao, acoes) = tipoUsuario.ToUpper() switch
        {
            "AUTOR" => (
                "Bem-vindo como Autor!",
                "Seu cadastro como <strong>Autor</strong> foi realizado com sucesso na plataforma AcadEvents.",
                new List<string>
                {
                    "Submeter trabalhos científicos para eventos disponíveis",
                    "Acompanhar o status de suas submissões",
                    "Gerenciar seu perfil acadêmico e currículo Lattes",
                    "Visualizar feedback dos avaliadores sobre seus trabalhos"
                }
            ),
            "AVALIADOR" => (
                "Bem-vindo como Avaliador!",
                "Seu cadastro como <strong>Avaliador</strong> foi realizado com sucesso na plataforma AcadEvents.",
                new List<string>
                {
                    "Receber convites para avaliar submissões de eventos",
                    "Avaliar trabalhos científicos com critérios detalhados",
                    "Participar de comitês científicos quando convidado",
                    "Gerenciar suas especialidades e disponibilidade"
                }
            ),
            "ORGANIZADOR" => (
                "Bem-vindo como Organizador!",
                "Seu cadastro como <strong>Organizador</strong> foi realizado com sucesso na plataforma AcadEvents.",
                new List<string>
                {
                    "Criar e gerenciar eventos acadêmicos",
                    "Configurar trilhas temáticas e comitês científicos",
                    "Acompanhar submissões e avaliações dos eventos",
                    "Tomar decisões finais sobre trabalhos submetidos"
                }
            ),
            _ => (
                "Bem-vindo ao AcadEvents!",
                "Seu cadastro foi realizado com sucesso na plataforma AcadEvents.",
                new List<string>
                {
                    "Acessar sua conta e explorar os eventos disponíveis",
                    "Gerenciar seu perfil acadêmico"
                }
            )
        };

        var acoesHtml = string.Join("", acoes.Select(acao => $"<li>{acao}</li>"));

        return $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{titulo}</title>
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
            <h1>{titulo}</h1>
        </div>
        <div class=""content"">
            <p>Olá <strong>{nome}</strong>,</p>
            <p>É um prazer tê-lo(a) conosco! {descricao}</p>
            <p>Como <strong>{tipoUsuario}</strong>, você pode:</p>
            <ul>
                {acoesHtml}
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
            <p>Você pode acessar o <strong>painel do autor</strong> para visualizar mais detalhes sobre a atualização, incluindo feedback dos avaliadores (quando disponível) e próximos passos.</p>
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
        bool avaliacaoDuploCego)
    {
        var avaliacaoDuploCegoTexto = avaliacaoDuploCego ? "Sim" : "Não";

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
            </div>

            <p><strong>Lembre-se:</strong> Como organizador, é importante acompanhar os prazos de submissão e avaliação para garantir o sucesso do evento.</p>
            <p>Você pode acessar o <strong>painel do organizador</strong> para gerenciar o evento, criar comitês científicos, acompanhar submissões e tomar decisões finais quando necessário.</p>
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
                    <li>Receber convites automáticos para avaliar submissões do evento</li>
                    <li>Avaliar trabalhos científicos com critérios detalhados (originalidade, metodologia, relevância, redação)</li>
                    <li>Fornecer recomendações sobre cada submissão (Aprovar, Rejeitar ou Aprovar com Ressalvas)</li>
                    <li>Contribuir para a qualidade científica do evento através de suas avaliações</li>
                </ul>
            </div>

            <p>Você pode acessar o <strong>painel do avaliador</strong> para visualizar mais detalhes sobre o comitê. Quando houver submissões disponíveis para avaliação, você receberá notificações automáticas.</p>
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

    public static string ConviteRecusadoTemplate(
        string nomeOrganizador,
        string nomeAvaliador,
        string tituloSubmissao,
        string motivoRecusa,
        int quantidadeFaltante,
        int numeroRequerido)
    {
        var alertaTexto = quantidadeFaltante > 0 
            ? $"⚠️ <strong>Atenção:</strong> Faltam <strong>{quantidadeFaltante}</strong> avaliação(ões) para atingir o mínimo de {numeroRequerido} avaliações por submissão."
            : "O número mínimo de avaliações já foi atingido.";

        var alertaCor = quantidadeFaltante > 0 ? "#f44336" : "#4caf50";

        return $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Convite Recusado - AcadEvents</title>
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
            color: #f44336;
            margin: 0;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .alert-box {{
            background-color: #ffebee;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid {alertaCor};
        }}
        .alert-box h3 {{
            color: {alertaCor};
            margin-top: 0;
        }}
        .info-box {{
            background-color: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }}
        .info-row {{
            margin: 10px 0;
            padding: 8px 0;
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
        .motivo-box {{
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }}
        .action-box {{
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
        }}
        .action-box h3 {{
            color: #1976d2;
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
            <h1>🔔 Convite de Avaliação Recusado</h1>
        </div>
        <div class=""content"">
            <p>Olá <strong>{nomeOrganizador}</strong>,</p>
            <p>Informamos que um avaliador recusou o convite para avaliar uma submissão no evento que você organiza.</p>
            
            <div class=""info-box"">
                <h2>Detalhes da Submissão</h2>
                <div class=""info-row"">
                    <span class=""info-label"">Título:</span>
                    <span class=""info-value"">{tituloSubmissao}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Avaliador:</span>
                    <span class=""info-value"">{nomeAvaliador}</span>
                </div>
            </div>

            <div class=""alert-box"">
                <h3>{alertaTexto}</h3>
            </div>

            <div class=""motivo-box"">
                <p><strong>Motivo da Recusa:</strong></p>
                <p>{motivoRecusa}</p>
            </div>

            <div class=""action-box"">
                <h3>📋 Ação Necessária</h3>
                <p>Como organizador, para garantir que a submissão tenha o número mínimo de avaliações necessárias ({numeroRequerido}), você pode:</p>
                <ul>
                    <li>Adicionar um novo avaliador ao comitê científico do evento através do painel do organizador</li>
                    <li>O novo avaliador receberá automaticamente convites para todas as submissões pendentes</li>
                    <li>Acompanhar o status das avaliações e tomar decisões finais quando necessário</li>
                </ul>
                <p><strong>Acesse o painel do organizador</strong> para gerenciar o comitê científico, visualizar o status das avaliações e adicionar novos avaliadores quando necessário.</p>
            </div>

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

    public static string SubmissaoEmRevisaoTemplate(
        string nomeOrganizador,
        string tituloSubmissao,
        string nomeEvento,
        long submissaoId)
    {
        return $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Decisão Final Necessária - Submissão em Revisão - AcadEvents</title>
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
            color: #e67e22;
            margin: 0;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .info-box {{
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }}
        .info-box h2 {{
            color: #856404;
            margin-top: 0;
        }}
        .highlight {{
            background-color: #e8f5e9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
        }}
        .highlight h3 {{
            color: #2e7d32;
            margin-top: 0;
        }}
        .action-box {{
            background-color: #fce4ec;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #e91e63;
            text-align: center;
        }}
        .action-box h3 {{
            color: #c2185b;
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
            <h1>⚠️ Decisão Final Necessária</h1>
        </div>
        <div class=""content"">
            <p>Olá <strong>{nomeOrganizador}</strong>,</p>
            <p>Uma submissão requer sua <strong>decisão final como organizador do evento</strong>.</p>
            
            <div class=""info-box"">
                <h2>{tituloSubmissao}</h2>
                <p><strong>Evento:</strong> {nomeEvento}</p>
                <p><strong>Status Atual:</strong> <span style=""color: #e67e22; font-weight: bold;"">EM REVISÃO</span></p>
            </div>

            <div class=""highlight"">
                <h3>📋 Situação da Submissão</h3>
                <p>Esta submissão está com <strong>status EM_REVISÃO</strong>, o que significa que houve um empate nas avaliações (50% de aprovação e 50% de rejeição).</p>
                <p>Como organizador do evento, você precisa decidir o destino final desta submissão:</p>
                <ul>
                    <li><strong>Aprovar:</strong> A submissão será aceita no evento</li>
                    <li><strong>Rejeitar:</strong> A submissão será rejeitada e não participará do evento</li>
                </ul>
            </div>

            <div class=""action-box"">
                <h3>⚡ Ação Requerida</h3>
                <p><strong>Sua decisão é essencial para o andamento do evento!</strong></p>
                <p>Acesse o painel do organizador e visualize a submissão para tomar sua decisão informada.</p>
            </div>

            <p>Por favor, acesse o painel do organizador e revise a submissão para tomar sua decisão final.</p>
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

