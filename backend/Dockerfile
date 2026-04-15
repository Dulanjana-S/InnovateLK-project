FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
COPY .env.example ./.env.example
RUN mkdir -p /app/uploads

RUN npm run build

EXPOSE 3001
CMD ["node", "dist/main.js"]
