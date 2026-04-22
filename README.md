# 🏥 Clínica — Sistema de Gestão de Exames

Sistema web para gerenciamento de pacientes e exames médicos não-DICOM. Desenvolvido com **FastAPI** (backend), **React** (frontend) e **PostgreSQL** (banco de dados), empacotado em **Docker**.

---

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Acesso ao Sistema](#-acesso-ao-sistema)
- [Perfis de Usuário](#-perfis-de-usuário)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Uso](#-uso)
- [Backup](#-backup)
- [Atualização](#-atualização)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [API](#-api)

---

## ✅ Funcionalidades

### Dashboard
- Total de pacientes e exames cadastrados
- Contador de exames e pacientes do dia
- Lista dos últimos 10 pacientes cadastrados
- Atalho para cadastro rápido de paciente

### Pacientes
- Cadastro completo (nome, CPF, nascimento, telefone, email, endereço, observações)
- Busca parcial por nome em tempo real
- Filtros de período: **Hoje**, **Ontem**, **Últimos 7 dias**, **Personalizado**
- Paginação (10 por página)
- Data de cadastro automática

### Exames
- Upload de arquivos (PDF, JPG, PNG, GIF, WEBP) — máximo 5MB por arquivo
- Drag & drop na área de upload
- Tipo de exame configurável pelo administrador
- Data de realização e observações por exame
- Download/visualização do arquivo
- Exclusão (apenas admin)

### WhatsApp
- Selecione um ou mais exames na tela do paciente
- Clique em **WhatsApp** para abrir mensagem pré-formatada
- Mensagem inclui nome do paciente, tipo, data e link de cada exame

### Usuários
- Cadastro com nome, email, senha e perfil
- Ativação/desativação de acesso
- Troca de senha
- Autenticação JWT com expiração de sessão (60 min)

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.11 + FastAPI + SQLAlchemy |
| Frontend | React 18 + Vite + React Router |
| Banco de dados | PostgreSQL 15 |
| Autenticação | JWT (python-jose) + bcrypt (passlib) |
| Servidor web | Nginx (proxy reverso) |
| Containers | Docker + Docker Compose |

---

## 📦 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) versão 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- 2 GB de RAM disponível
- Portas **80** disponível no servidor

---

## 🚀 Instalação

### 1. Copie os arquivos para o servidor

```bash
# Crie a pasta do projeto
mkdir clinica && cd clinica

# Copie todos os arquivos do ZIP para esta pasta
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Edite o `.env` com suas senhas (veja a seção [Variáveis de Ambiente](#-variáveis-de-ambiente)).

### 3. Gere uma chave secreta segura

```bash
openssl rand -hex 32
# Cole o resultado no campo SECRET_KEY do .env
```

### 4. Suba os containers

```bash
docker compose up -d --build
```

A primeira execução fará o build das imagens e pode levar alguns minutos.

### 5. Verifique se está tudo rodando

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

## ⚙️ Configuração

### Estrutura de pastas necessária

```
clinica/
├── .env                  ← suas senhas (não commitar!)
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
└── frontend/
    ├── Dockerfile
    └── src/
```

### Primeiro acesso — usuário admin padrão

Na primeira execução, o sistema cria automaticamente um usuário administrador:

| Campo | Valor |
|---|---|
| Email | `admin@clinica.local` |
| Senha | `Admin@123` |

> ⚠️ **Altere a senha do admin imediatamente após o primeiro acesso!**

---

## 🌐 Acesso ao Sistema

| Interface | URL |
|---|---|
| Sistema (via Nginx) | `http://SEU-IP` |
| Backend API (docs) | `http://SEU-IP/api/docs` |

---

## 👥 Perfis de Usuário

| Perfil | Dashboard | Ver Pacientes | Cadastrar Paciente | Adicionar Exame | Gerenciar Usuários | Tipos de Exame | Excluir Exame |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Enfermagem** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Atendimento** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 📁 Estrutura do Projeto

```
clinica/
├── docker-compose.yml              # Orquestração dos containers
├── .env.example                    # Modelo de variáveis de ambiente
│
├── nginx/
│   └── nginx.conf                  # Proxy reverso (porta 80)
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # Inicialização FastAPI + startup
│       ├── config.py               # Configurações via env vars
│       ├── database.py             # Conexão PostgreSQL (SQLAlchemy)
│       ├── models.py               # Modelos de banco (ORM)
│       ├── schemas.py              # Schemas de validação (Pydantic)
│       ├── routers/
│       │   ├── auth.py             # Login / token JWT
│       │   ├── dashboard.py        # Estatísticas do dashboard
│       │   ├── pacientes.py        # CRUD de pacientes
│       │   ├── exames.py           # Upload e gestão de exames
│       │   └── usuarios.py         # Gestão de usuários (admin)
│       └── utils/
│           ├── auth.py             # JWT, bcrypt, guards de perfil
│           └── files.py            # Upload, validação e storage
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── nginx.conf                  # Nginx interno do container React
    └── src/
        ├── App.jsx                 # Rotas principais
        ├── index.css               # Estilos globais
        ├── main.jsx                # Entry point React
        ├── contexts/
        │   └── AuthContext.jsx     # Estado global de autenticação
        ├── services/
        │   └── api.js              # Axios configurado
        ├── components/
        │   ├── Layout.jsx          # Sidebar + estrutura de página
        │   └── ModalExame.jsx      # Modal de upload de exame
        └── pages/
            ├── Login.jsx           # Tela de login
            ├── Dashboard.jsx       # Painel inicial
            ├── Pacientes.jsx       # Listagem com busca e filtros
            ├── PacienteDetalhe.jsx # Detalhe + exames + WhatsApp
            ├── PacienteForm.jsx    # Cadastro / edição
            ├── Usuarios.jsx        # Gestão de usuários (admin)
            └── TiposExame.jsx      # Tipos de exame (admin)
```

---

## 📖 Uso

### Cadastrar tipo de exame (necessário antes de adicionar exames)

1. Faça login como **admin**
2. Menu lateral → **Tipos de Exame**
3. Clique em **Novo Tipo** e preencha o nome (ex: Hemograma, Raio-X, Ultrassom)

### Cadastrar paciente

1. Menu lateral → **Novo Paciente** (ou botão no Dashboard)
2. Preencha nome completo e data de nascimento (obrigatórios)
3. CPF, telefone, email, endereço e observações são opcionais
4. Clique em **Cadastrar Paciente**

### Adicionar exame ao paciente

1. Abra o cadastro do paciente
2. Clique em **Adicionar Exame**
3. Selecione o tipo, informe a data de realização
4. Arraste ou clique para selecionar o arquivo (PDF ou imagem, máx. 5MB)
5. Clique em **Salvar Exame**

### Enviar exame por WhatsApp

1. Na tela do paciente, **clique nos exames** para selecioná-los (checkbox)
2. O botão verde **WhatsApp** aparecerá no topo da lista
3. Clique nele — o WhatsApp Web abrirá com a mensagem e links já preenchidos

> O paciente precisa ter **telefone cadastrado** para o botão funcionar.

### Filtrar pacientes por período

Na tela de **Pacientes**, use os botões de período:
- **Hoje** — pacientes cadastrados hoje
- **Ontem** — pacientes cadastrados ontem
- **Últimos 7 dias** — da semana atual
- **Personalizado** — escolha datas início e fim

---

## 💾 Backup

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

## 🔄 Atualização

```bash
# 1. Baixar novas imagens
docker compose pull

# 2. Recompilar e reiniciar
docker compose up -d --build

# 3. Verificar logs
docker compose logs -f backend
```

---

## 🔧 Variáveis de Ambiente

Crie o arquivo `.env` a partir do `.env.example`:

```env
# Banco de dados PostgreSQL
DB_NAME=clinica
DB_USER=clinica
DB_PASSWORD=SUA_SENHA_FORTE_AQUI

# Chave secreta para JWT — gere com: openssl rand -hex 32
SECRET_KEY=SUA_CHAVE_SECRETA_LONGA_E_ALEATORIA
```

---

## 📡 API

A documentação interativa da API está disponível em:

```
http://SEU-IP/api/docs       ← Swagger UI
http://SEU-IP/api/redoc      ← ReDoc
```

### Principais endpoints

| Método | Endpoint | Descrição | Perfil mínimo |
|---|---|---|---|
| POST | `/api/auth/login` | Login e geração de token | Público |
| GET | `/api/dashboard` | Estatísticas gerais | Todos |
| GET | `/api/pacientes` | Listar pacientes (com busca/filtro) | Todos |
| POST | `/api/pacientes` | Cadastrar paciente | Enfermagem+ |
| GET | `/api/pacientes/{id}` | Detalhe do paciente + exames | Todos |
| PUT | `/api/pacientes/{id}` | Editar paciente | Enfermagem+ |
| POST | `/api/pacientes/{id}/exames` | Adicionar exame (upload) | Enfermagem+ |
| GET | `/api/exames/{id}/arquivo` | Download do arquivo | Todos |
| DELETE | `/api/exames/{id}` | Excluir exame | Admin |
| GET | `/api/tipos-exame` | Listar tipos de exame | Todos |
| POST | `/api/tipos-exame` | Criar tipo de exame | Admin |
| GET | `/api/usuarios` | Listar usuários | Admin |
| POST | `/api/usuarios` | Criar usuário | Admin |
| PUT | `/api/usuarios/{id}` | Editar usuário | Admin |

---

## 🛡️ Segurança

- Senhas armazenadas com **bcrypt** (nunca em texto puro)
- Autenticação via **JWT** com expiração de 60 minutos
- Guards de perfil em todas as rotas sensíveis
- Validação de tipo e tamanho de arquivo no upload
- Variáveis sensíveis isoladas no `.env` (nunca commitar)

---

## 🐛 Logs e Diagnóstico

```bash
# Ver todos os logs ao vivo
docker compose logs -f

# Logs por serviço
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f nginx

# Status dos containers
docker compose ps

# Reiniciar um serviço específico
docker compose restart backend
```

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Os logs com `docker compose logs -f backend`
2. Se todos os containers estão `running` com `docker compose ps`
3. Se o arquivo `.env` está preenchido corretamente

---

*Sistema desenvolvido para uso clínico interno. Para ambientes de produção, recomenda-se configurar HTTPS com certificado SSL.*
