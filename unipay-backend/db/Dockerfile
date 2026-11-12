FROM mysql:8.4
COPY database.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY db/init/02-seed.sql /docker-entrypoint-initdb.d/02-seed.sql
