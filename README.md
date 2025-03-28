# 🚀 API Mentoria - NestJS + SQLite

API para sistema de mentoria com NestJS e Prisma usando SQLite para simplificar a avaliação.

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm
- Git (opcional)

## 🛠️ Instalação

```bash
git clone [url-do-repositorio]
cd [nome-da-pasta]
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

## 🌐 Rotas da API

### 👤 Contas de Usuário

GET /accounts
Lista todos os usuários cadastrados

POST /accounts
Cadastra um novo usuário

Body:

```
{
  "name": "nome",
  "email": "email@example.com",
  "password": "minhasenha"
}
```

🧠 Áreas de Conhecimento

GET /mentors/knowledgeAreas/list

Lista todas as áreas de conhecimento

👨‍🏫 Mentores

GET /mentors

Lista todos os mentores

GET /mentors/:knowledgeAreaId/knowledgeAreas

Lista mentores por área de conhecimento

Exemplo:

GET /mentors/bdbd52fd-b8bd-4672-8a94-d0f25349c26b/knowledgeAreas

POST /mentors/:mentorId/createSkills
Atualiza todas as skills de um mentor

Exemplo:

POST /mentors/3dd281bd-d589-4759-b780-fa70cd25dfa0/createSkills
Body:

```
[
  {
    "name": "TEST",
    "fk_knowledge_area_id": "89541bbb-59c4-4cf1-b6ce-6183495ceb9c"
  },
  {
    "name": "TEST2",
    "fk_knowledge_area_id": "bdbd52fd-b8bd-4672-8a94-d0f25349c26b"
  }
]
```

DELETE /mentor/skills/:skillId
Remove uma skill de um mentor

Exemplo:

DELETE /mentor/skills/7b217edf-8c47-4350-81e5-3369a22b0663

## 📌 Observações

O banco já vem com dados iniciais para testes

Todas as rotas retornam JSON

IDs devem ser UUID no formato especificado

A autenticação via token está desativada para facilitar os testes
