# InnovateLK Backend

NestJS backend for the patent commercialization platform.

## Run locally

```bash
cp .env.example .env
npm install
npm run db:seed
npm run start:dev
```

## Run with Docker

From the project root:

```bash
docker compose up --build -d
docker compose exec backend npm run db:seed
```

## Default local API

```text
http://localhost:3001/api
```
