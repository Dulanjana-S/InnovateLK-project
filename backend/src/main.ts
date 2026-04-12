import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // CORS configuration
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS')
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      // Allow any localhost/127.0.0.1 port so frontend still works
      // if Vite auto-switches from 5173 to 5174+.
      const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalDevOrigin) {
        return callback(null, true);
      }

      if (!corsOrigins || corsOrigins.length === 0 || corsOrigins.includes('*')) {
        return callback(null, true);
      }

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('InnovateLK API')
    .setDescription('Patent Commercialization Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );


  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 InnovateLK Backend Server Started!              ║
║                                                       ║
║   🌐 Server running on: http://localhost:${port}       ║
║   📡 API available at: http://localhost:${port}/api   ║
║   📚 Swagger docs: http://localhost:${port}/api/docs  ║
║   🔧 Environment: ${configService.get('NODE_ENV')}                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
