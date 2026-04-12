FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
COPY .env.example ./.env.example

RUN npm run build

EXPOSE 3001
CMD ["node", "dist/main.js"]
