# UniPay

Protótipo de internet banking com frontend React, API Express e banco MySQL.

## Executar com Docker Compose

Instale o Docker com Compose e, a partir desta pasta, execute:

```sh
docker compose up --build
```

Abra [http://localhost:8080](http://localhost:8080). A API fica em `http://localhost:3001`. Para encerrar, execute `docker compose down` nesta mesma pasta.

A estrutura contém `unipay-frontend/` e `unipay-backend/`; o Compose inicia o frontend, a API e o MySQL juntos.
O esquema SQL com os `CREATE TABLE` está em `unipay-backend/database.sql`; o Docker também usa esse arquivo ao inicializar um banco vazio.
