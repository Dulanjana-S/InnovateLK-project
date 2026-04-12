FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY index.html ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY postcss.config.mjs ./
COPY public ./public
COPY src ./src

ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
