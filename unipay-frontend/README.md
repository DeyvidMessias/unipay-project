# UniPay

Protótipo de uma interface bancária brasileira, desenvolvido com React, TypeScript e Vite.

## Executar a aplicação web

Para executar a aplicação completa com frontend, API Express e MySQL em contêineres, use o Compose na raiz do projeto:

```sh
cd ..
docker compose up --build
```

Abra `http://localhost:8080`. A API está disponível em `http://localhost:3001/health`. O banco persiste em um volume Docker.

O Compose usa valores padrão para demonstração local. Para configurar credenciais próprias, copie `unipay-backend/.env.example` para `.env` na raiz do projeto e altere os valores antes de compartilhar ou expor as portas.

Na raiz do projeto, `docker compose down` para os contêineres sem apagar os dados. `docker compose down -v` remove também o volume do MySQL e todas as contas de demonstração.

### Executar somente o frontend em modo de desenvolvimento

Com a API e o MySQL iniciados localmente na porta `3001`, na pasta `unipay-frontend`, instale as dependências e inicie o servidor:

```sh
npm install
npm run dev
```

Abra o endereço local exibido pelo Vite, normalmente `http://localhost:5173`.

## Criar e executar o ambiente virtual de Python

O ambiente virtual e as dependências Python ficam na pasta `teste`, separados das dependências da aplicação web. Os comandos abaixo consideram que o terminal está na pasta `unipay-frontend`.

1. Acesse a pasta `teste`:

   ```sh
   cd teste
   ```

2. Crie o ambiente virtual:

   ```sh
   python -m venv .venv
   ```

3. Ative o ambiente virtual:

   **PowerShell (Windows):**

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

   **Prompt de Comando (Windows):**

   ```bat
   .venv\Scripts\activate.bat
   ```

   **macOS ou Linux:**

   ```sh
   source .venv/bin/activate
   ```

4. Instale as dependências listadas em `requirements.txt`:

   ```sh
   python -m pip install -r requirements.txt
   ```

Com o ambiente ativado, execute os comandos Python necessários a partir da pasta `teste`. Para sair do ambiente virtual, use:

```sh
deactivate
```

## Estrutura do projeto

- `src/pages/` contém as páginas inicial, de login, de cadastro e do PIX.
- `src/components/` contém componentes compartilhados de layout, navegação, saldo, extrato e transações.
- `src/api.ts` contém o cliente HTTP usado para acessar a API Express.
- `../unipay-backend/` contém o backend, o esquema MySQL e a configuração Docker Compose.
- `teste/requirements.txt` lista as dependências Python usadas na pasta `teste`.

O cadastro cria uma chave PIX usando o endereço de e-mail. Os controles da interface têm atributos HTML `id` descritivos para inspeção no navegador e futuras automações.
