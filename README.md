# 🚀 API Mentoria - NestJS + SQLite

API para sistema de mentoria desenvolvida com NestJS e Prisma, utilizando SQLite para simplificar a avaliação e o desenvolvimento local.

## 🌟 Sobre

Este projeto é uma API RESTful para um sistema de mentoria, permitindo o gerenciamento de contas de usuário, áreas de conhecimento e informações de mentores. A escolha do SQLite como banco de dados visa facilitar a configuração e execução para fins de avaliação e prototipagem rápida. A autenticação por token foi desabilitada para agilizar o processo de teste.

## 📋 Pré-requisitos

Para executar este projeto, você precisará ter o seguinte instalado em sua máquina:

* **Node.js**: Versão 18 ou superior. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).
* **npm**: Gerenciador de pacotes do Node.js, que geralmente vem junto com a instalação do Node.js.
* **Git**: (Opcional, mas recomendado) Para clonar o repositório facilmente. Você pode baixá-lo em [git-scm.com](https://git-scm.com/).

## 🛠️ Instalação e Execução

Siga os passos abaixo para configurar e rodar a API em seu ambiente local:

1.  **Clone o Repositório**:
    ```bash
    git clone [https://github.com/danielSramos/mentor-api-ts](https://github.com/danielSramos/mentor-api-ts)
    ```
2.  **Navegue até o Diretório do Projeto**:
    ```bash
    cd mentor-api-ts
    ```
3.  **Instale as Dependências**:
    ```bash
    npm install
    ```
4.  **Gere o Cliente Prisma**:
    ```bash
    npx prisma generate
    ```
5.  **Execute as Migrações do Banco de Dados**:
    Isso criará o arquivo do banco de dados SQLite e populará com os dados iniciais.
    ```bash
    npx prisma migrate dev --name init
    ```
6.  **Inicie a API em Modo de Desenvolvimento**:
    ```bash
    npm run start:dev
    ```
    A API estará disponível em `http://localhost:3000` (porta padrão do NestJS, a menos que configurada de outra forma).

## 🧪 Rodando Testes

Este projeto inclui testes unitários, de integração e end-to-end (e2e) para garantir a qualidade e o comportamento esperado da API.

* **Rodar Testes Unitários e de Integração**:
    ```bash
    npm test
    ```
* **Rodar Testes End-to-End (e2e)**:
    ```bash
    npm run test:e2e
    ```

## 🌐 Rotas da API

As rotas da API estão organizadas por funcionalidade. Todas as respostas da API são retornadas em formato JSON.

### 👤 Contas de Usuário

* **`GET /accounts`**
    Lista todos os usuários cadastrados.

* **`POST /accounts`**
    Cadastra um novo usuário.

    **Body:**
    ```json
    {
      "name": "nome",
      "email": "email@example.com",
      "password": "minhasenha"
    }
    ```

### 🧠 Áreas de Conhecimento

* **`GET /mentors/knowledgeAreas/list`**
    Lista todas as áreas de conhecimento disponíveis.

### 👨‍🏫 Mentores

* **`GET /mentors`**
    Lista todos os mentores cadastrados.

* **`GET /mentors/:knowledgeAreaId/knowledgeAreas`**
    Lista mentores filtrados por uma área de conhecimento específica.

    **Exemplo:**
    ```
    GET /mentors/bdbd52fd-b8bd-4672-8a94-d0f25349c26b/knowledgeAreas
    ```

* **`POST /mentors/:mentorId/createSkills`**
    Atualiza todas as skills de um mentor específico.

    **Exemplo:**
    ```
    POST /mentors/3dd281bd-d589-4759-b780-fa70cd25dfa0/createSkills
    ```
    **Body:**
    ```json
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

* **`DELETE /mentor/skills/:skillId`**
    Remove uma skill específica de um mentor.

    **Exemplo:**
    ```
    DELETE /mentor/skills/7b217edf-8c47-4350-81e5-3369a22b0663
    ```

## 📌 Observações Importantes

* **Dados Iniciais**: O banco de dados SQLite já vem pré-carregado com dados iniciais para facilitar os testes e a exploração da API.
* **Formato dos IDs**: Todos os IDs utilizados nas rotas devem ser UUIDs válidos no formato especificado (ex: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`).
* **Autenticação**: A autenticação via token está desativada por padrão para simplificar o processo de testes e avaliação. Em um ambiente de produção, a autenticação é um requisito fundamental.