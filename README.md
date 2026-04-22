# ðŸ¥ ClÃ­nica â€” Sistema de GestÃ£o de Exames

Sistema web para gerenciamento de pacientes e exames mÃ©dicos nÃ£o-DICOM. Desenvolvido com **FastAPI** (backend), **React** (frontend) e **PostgreSQL** (banco de dados), empacotado em **Docker**.

---

## ðŸ“‹ SumÃ¡rio

- [Funcionalidades](#-funcionalidades)
- [Stack TecnolÃ³gica](#-stack-tecnolÃ³gica)
- [PrÃ©-requisitos](#-prÃ©-requisitos)
- [InstalaÃ§Ã£o](#-instalaÃ§Ã£o)
- [ConfiguraÃ§Ã£o](#-configuraÃ§Ã£o)
- [Acesso ao Sistema](#-acesso-ao-sistema)
- [Perfis de UsuÃ¡rio](#-perfis-de-usuÃ¡rio)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Uso](#-uso)
- [Backup](#-backup)
- [AtualizaÃ§Ã£o](#-atualizaÃ§Ã£o)
- [VariÃ¡veis de Ambiente](#-variÃ¡veis-de-ambiente)
- [API](#-api)

---

## âœ… Funcionalidades

### Dashboard
- Total de pacientes e exames cadastrados
- Contador de exames e pacientes do dia
- Lista dos Ãºltimos 10 pacientes cadastrados
- Atalho para cadastro rÃ¡pido de paciente

### Pacientes
- Cadastro completo (nome, CPF, nascimento, telefone, email, endereÃ§o, observaÃ§Ãµes)
- Busca parcial por nome em tempo real
- Filtros de perÃ­odo: **Hoje**, **Ontem**, **Ãšltimos 7 dias**, **Personalizado**
- PaginaÃ§Ã£o (10 por pÃ¡gina)
- Data de cadastro automÃ¡tica

### Exames
- Upload de arquivos (PDF, JPG, PNG, GIF, WEBP) â€” mÃ¡ximo 5MB por arquivo
- Drag & drop na Ã¡rea de upload
- Tipo de exame configurÃ¡vel pelo administrador
- Data de realizaÃ§Ã£o e observaÃ§Ãµes por exame
- Download/visualizaÃ§Ã£o do arquivo
- ExclusÃ£o (apenas admin)

### WhatsApp
- Selecione um ou mais exames na tela do paciente
- Clique em **WhatsApp** para abrir mensagem prÃ©-formatada
- Mensagem inclui nome do paciente, tipo, data e link de cada exame

### UsuÃ¡rios
- Cadastro com nome, email, senha e perfil
- AtivaÃ§Ã£o/desativaÃ§Ã£o de acesso
- Troca de senha
- AutenticaÃ§Ã£o JWT com expiraÃ§Ã£o de sessÃ£o (60 min)

---

## ðŸ›  Stack TecnolÃ³gica

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.11 + FastAPI + SQLAlchemy |
| Frontend | React 18 + Vite + React Router |
| Banco de dados | PostgreSQL 15 |
| AutenticaÃ§Ã£o | JWT (python-jose) + bcrypt (passlib) |
| Servidor web | Nginx (proxy reverso) |
| Containers | Docker + Docker Compose |

---

## ðŸ“¦ PrÃ©-requisitos

- [Docker](https://docs.docker.com/get-docker/) versÃ£o 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- 2 GB de RAM disponÃ­vel
- Portas **80** disponÃ­vel no servidor

---

## ðŸš€ InstalaÃ§Ã£o

### 1. Copie os arquivos para o servidor

```bash
# Crie a pasta do projeto
mkdir clinica && cd clinica

# Copie todos os arquivos do ZIP para esta pasta
```

### 2. Configure as variÃ¡veis de ambiente

```bash
cp .env.example .env
nano .env
```

Edite o `.env` com suas senhas (veja a seÃ§Ã£o [VariÃ¡veis de Ambiente](#-variÃ¡veis-de-ambiente)).

### 3. Gere uma chave secreta segura

```bash
openssl rand -hex 32
# Cole o resultado no campo SECRET_KEY do .env
```

### 4. Suba os containers

```bash
docker compose up -d --build
```

A primeira execuÃ§Ã£o farÃ¡ o build das imagens e pode levar alguns minutos.

### 5. Verifique se estÃ¡ tudo rodando

```bash
docker compose ps
```

Todos os 4 containers devem aparecer como `running`:

```
NAME                STATUS
clinica_db          running
clinica_backend     running
clinica_frontend    running
clinica_nginx       running
```

---

## âš™ï¸ ConfiguraÃ§Ã£o

### Estrutura de pastas necessÃ¡ria

```
clinica/
â”œâ”€â”€ .env                  â† suas senhas (nÃ£o commitar!)
â”œâ”€â”€ docker-compose.yml
â”œâ”€â”€ nginx/
â”‚   â””â”€â”€ nginx.conf
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ Dockerfile
â”‚   â”œâ”€â”€ requirements.txt
â”‚   â””â”€â”€ app/
â””â”€â”€ frontend/
    â”œâ”€â”€ Dockerfile
    â””â”€â”€ src/
```

### Primeiro acesso â€” usuÃ¡rio admin padrÃ£o

Na primeira execuÃ§Ã£o, o sistema cria automaticamente um usuÃ¡rio administrador:

| Campo | Valor |
|---|---|
| Email | `admin@clinica.local` |
| Senha | `Admin@123` |

> âš ï¸ **Altere a senha do admin imediatamente apÃ³s o primeiro acesso!**

---

## ðŸŒ Acesso ao Sistema

| Interface | URL |
|---|---|
| Sistema (via Nginx) | `http://SEU-IP` |
| Backend API (docs) | `http://SEU-IP/api/docs` |

---

## ðŸ‘¥ Perfis de UsuÃ¡rio

| Perfil | Dashboard | Ver Pacientes | Cadastrar Paciente | Adicionar Exame | Gerenciar UsuÃ¡rios | Tipos de Exame | Excluir Exame |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admin** | âœ… | âœ… | âœ… | âœ… | âœ… | âœ… | âœ… |
| **Enfermagem** | âœ… | âœ… | âœ… | âœ… | âŒ | âŒ | âŒ |
| **Atendimento** | âœ… | âœ… | âŒ | âŒ | âŒ | âŒ | âŒ |

---

## ðŸ“ Estrutura do Projeto

```
clinica/
â”œâ”€â”€ docker-compose.yml              # OrquestraÃ§Ã£o dos containers
â”œâ”€â”€ .env.example                    # Modelo de variÃ¡veis de ambiente
â”‚
â”œâ”€â”€ nginx/
â”‚   â””â”€â”€ nginx.conf                  # Proxy reverso (porta 80)
â”‚
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ Dockerfile
â”‚   â”œâ”€â”€ requirements.txt
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ main.py                 # InicializaÃ§Ã£o FastAPI + startup
â”‚       â”œâ”€â”€ config.py               # ConfiguraÃ§Ãµes via env vars
â”‚       â”œâ”€â”€ database.py             # ConexÃ£o PostgreSQL (SQLAlchemy)
â”‚       â”œâ”€â”€ models.py               # Modelos de banco (ORM)
â”‚       â”œâ”€â”€ schemas.py              # Schemas de validaÃ§Ã£o (Pydantic)
â”‚       â”œâ”€â”€ routers/
â”‚       â”‚   â”œâ”€â”€ auth.py             # Login / token JWT
â”‚       â”‚   â”œâ”€â”€ dashboard.py        # EstatÃ­sticas do dashboard
â”‚       â”‚   â”œâ”€â”€ pacientes.py        # CRUD de pacientes
â”‚       â”‚   â”œâ”€â”€ exames.py           # Upload e gestÃ£o de exames
â”‚       â”‚   â””â”€â”€ usuarios.py         # GestÃ£o de usuÃ¡rios (admin)
â”‚       â””â”€â”€ utils/
â”‚           â”œâ”€â”€ auth.py             # JWT, bcrypt, guards de perfil
â”‚           â””â”€â”€ files.py            # Upload, validaÃ§Ã£o e storage
â”‚
â””â”€â”€ frontend/
    â”œâ”€â”€ Dockerfile
    â”œâ”€â”€ package.json
    â”œâ”€â”€ vite.config.js
    â”œâ”€â”€ index.html
    â”œâ”€â”€ nginx.conf                  # Nginx interno do container React
    â””â”€â”€ src/
        â”œâ”€â”€ App.jsx                 # Rotas principais
        â”œâ”€â”€ index.css               # Estilos globais
        â”œâ”€â”€ main.jsx                # Entry point React
        â”œâ”€â”€ contexts/
        â”‚   â””â”€â”€ AuthContext.jsx     # Estado global de autenticaÃ§Ã£o
        â”œâ”€â”€ services/
        â”‚   â””â”€â”€ api.js              # Axios configurado
        â”œâ”€â”€ components/
        â”‚   â”œâ”€â”€ Layout.jsx          # Sidebar + estrutura de pÃ¡gina
        â”‚   â””â”€â”€ ModalExame.jsx      # Modal de upload de exame
        â””â”€â”€ pages/
            â”œâ”€â”€ Login.jsx           # Tela de login
            â”œâ”€â”€ Dashboard.jsx       # Painel inicial
            â”œâ”€â”€ Pacientes.jsx       # Listagem com busca e filtros
            â”œâ”€â”€ PacienteDetalhe.jsx # Detalhe + exames + WhatsApp
            â”œâ”€â”€ PacienteForm.jsx    # Cadastro / ediÃ§Ã£o
            â”œâ”€â”€ Usuarios.jsx        # GestÃ£o de usuÃ¡rios (admin)
            â””â”€â”€ TiposExame.jsx      # Tipos de exame (admin)
```

---

## ðŸ“– Uso

### Cadastrar tipo de exame (necessÃ¡rio antes de adicionar exames)

1. FaÃ§a login como **admin**
2. Menu lateral â†’ **Tipos de Exame**
3. Clique em **Novo Tipo** e preencha o nome (ex: Hemograma, Raio-X, Ultrassom)

### Cadastrar paciente

1. Menu lateral â†’ **Novo Paciente** (ou botÃ£o no Dashboard)
2. Preencha nome completo e data de nascimento (obrigatÃ³rios)
3. CPF, telefone, email, endereÃ§o e observaÃ§Ãµes sÃ£o opcionais
4. Clique em **Cadastrar Paciente**

### Adicionar exame ao paciente

1. Abra o cadastro do paciente
2. Clique em **Adicionar Exame**
3. Selecione o tipo, informe a data de realizaÃ§Ã£o
4. Arraste ou clique para selecionar o arquivo (PDF ou imagem, mÃ¡x. 5MB)
5. Clique em **Salvar Exame**

### Enviar exame por WhatsApp

1. Na tela do paciente, **clique nos exames** para selecionÃ¡-los (checkbox)
2. O botÃ£o verde **WhatsApp** aparecerÃ¡ no topo da lista
3. Clique nele â€” o WhatsApp Web abrirÃ¡ com a mensagem e links jÃ¡ preenchidos

> O paciente precisa ter **telefone cadastrado** para o botÃ£o funcionar.

### Filtrar pacientes por perÃ­odo

Na tela de **Pacientes**, use os botÃµes de perÃ­odo:
- **Hoje** â€” pacientes cadastrados hoje
- **Ontem** â€” pacientes cadastrados ontem
- **Ãšltimos 7 dias** â€” da semana atual
- **Personalizado** â€” escolha datas inÃ­cio e fim

---

## ðŸ’¾ Backup

### Banco de dados

```bash
# Gerar dump SQL com data no nome
docker compose exec -T db pg_dump \
  -U clinica clinica \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Arquivos de exames

```bash
# Backup do volume com os arquivos enviados
docker run --rm \
  -v clinica_uploads:/data:ro \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz /data
```

### Restaurar banco

```bash
docker compose exec -T db psql \
  -U clinica clinica \
  < backup_20240101_120000.sql
```

---

## ðŸ”„ AtualizaÃ§Ã£o

```bash
# 1. Baixar novas imagens
docker compose pull

# 2. Recompilar e reiniciar
docker compose up -d --build

# 3. Verificar logs
docker compose logs -f backend
```

---

## ðŸ”§ VariÃ¡veis de Ambiente

Crie o arquivo `.env` a partir do `.env.example`:

```env
# Banco de dados PostgreSQL
DB_NAME=clinica
DB_USER=clinica
DB_PASSWORD=SUA_SENHA_FORTE_AQUI

# Chave secreta para JWT â€” gere com: openssl rand -hex 32
SECRET_KEY=SUA_CHAVE_SECRETA_LONGA_E_ALEATORIA
```

---

## ðŸ“¡ API

A documentaÃ§Ã£o interativa da API estÃ¡ disponÃ­vel em:

```
http://SEU-IP/api/docs       â† Swagger UI
http://SEU-IP/api/redoc      â† ReDoc
```

### Principais endpoints

| MÃ©todo | Endpoint | DescriÃ§Ã£o | Perfil mÃ­nimo |
|---|---|---|---|
| POST | `/api/auth/login` | Login e geraÃ§Ã£o de token | PÃºblico |
| GET | `/api/dashboard` | EstatÃ­sticas gerais | Todos |
| GET | `/api/pacientes` | Listar pacientes (com busca/filtro) | Todos |
| POST | `/api/pacientes` | Cadastrar paciente | Enfermagem+ |
| GET | `/api/pacientes/{id}` | Detalhe do paciente + exames | Todos |
| PUT | `/api/pacientes/{id}` | Editar paciente | Enfermagem+ |
| POST | `/api/pacientes/{id}/exames` | Adicionar exame (upload) | Enfermagem+ |
| GET | `/api/exames/{id}/arquivo` | Download do arquivo | Todos |
| DELETE | `/api/exames/{id}` | Excluir exame | Admin |
| GET | `/api/tipos-exame` | Listar tipos de exame | Todos |
| POST | `/api/tipos-exame` | Criar tipo de exame | Admin |
| GET | `/api/usuarios` | Listar usuÃ¡rios | Admin |
| POST | `/api/usuarios` | Criar usuÃ¡rio | Admin |
| PUT | `/api/usuarios/{id}` | Editar usuÃ¡rio | Admin |

---

## ðŸ›¡ï¸ SeguranÃ§a

- Senhas armazenadas com **bcrypt** (nunca em texto puro)
- AutenticaÃ§Ã£o via **JWT** com expiraÃ§Ã£o de 60 minutos
- Guards de perfil em todas as rotas sensÃ­veis
- ValidaÃ§Ã£o de tipo e tamanho de arquivo no upload
- VariÃ¡veis sensÃ­veis isoladas no `.env` (nunca commitar)

---

## ðŸ› Logs e DiagnÃ³stico

```bash
# Ver todos os logs ao vivo
docker compose logs -f

# Logs por serviÃ§o
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f nginx

# Status dos containers
docker compose ps

# Reiniciar um serviÃ§o especÃ­fico
docker compose restart backend
```

---

## ðŸ“ž Suporte

Para dÃºvidas ou problemas, verifique:
1. Os logs com `docker compose logs -f backend`
2. Se todos os containers estÃ£o `running` com `docker compose ps`
3. Se o arquivo `.env` estÃ¡ preenchido corretamente

---

*Sistema desenvolvido para uso clÃ­nico interno. Para ambientes de produÃ§Ã£o, recomenda-se configurar HTTPS com certificado SSL.*
