# AcadEvents

Uma plataforma completa para gerenciamento de eventos acadêmicos. O sistema permite que organizadores criem e gerenciem eventos científicos, autores submetam trabalhos acadêmicos, e avaliadores revisem e avaliem submissões de forma estruturada e eficiente.

## Stack Utilizada

### Backend
<span>
<img src="https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET">
<img src="https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white" alt="C#">
<img src="https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white" alt="SQL Server">
<img src="https://img.shields.io/badge/Entity%20Framework-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt="Entity Framework">
</span>

### Frontend
<span>
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</span>

### DevOps & Ferramentas
<span>
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT">
</span>



### 📖 Documentação de API
- **Documentação interativa** com Scalar
- Endpoints documentados e testáveis
- Interface moderna para exploração da API

## 🏗️ Estrutura de Pastas

O projeto segue a seguinte estrutura de pastas:

```
/AcadEvents
    /backend
        /Controllers      # Endpoints da API REST
        /Data             # DbContext e configuração do Entity Framework
        /Dtos             # Data Transfer Objects
        /Extensions       # Extensões e configurações
        /Migrations       # Migrations do Entity Framework
        /Models           # Entidades do domínio
        /Repositories     # Camada de acesso aos dados
        /Services         # Lógica de negócio
    /frontend
        /app              # Rotas e páginas (Next.js App Router)
        /components       # Componentes React reutilizáveis
        /lib              # Serviços e utilitários
        /hooks            # Custom hooks
        /types            # Definições TypeScript
    /storage             # Armazenamento de arquivos
```

## 🖥️ Rodando Localmente

### Pré-requisitos

- .NET 10.0 SDK
- Node.js 20+ e npm/yarn
- Docker e Docker Compose
- Um cliente SQL Server (opcional, para visualização do banco)

### Passos

1. **Clone o repositório:**

```sh
git clone <url-do-repositorio>
cd AcadEvents
```

2. **Inicie os containers com Docker Compose:**

```sh
docker-compose up -d
```

Isso irá subir:
- SQL Server na porta `1433`
- Backend na porta `8080`
- Frontend na porta `3000`

3. **Acesse a aplicação:**

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Documentação da API (Scalar): `http://localhost:8080/scalar/v1` (em desenvolvimento)

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

Desenvolvido como parte do trabalho prático da disciplina de Tópicos Especiais em Programação III.


**AcadEvents** - Simplificando a gestão de eventos acadêmicos 🎓
