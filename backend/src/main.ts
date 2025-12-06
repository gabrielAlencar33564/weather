import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription('API de monitoramento e análise climática com IA')
    .setVersion('1.0')
    .addTag('Weather')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`🚀 Servidor rodando em: http://localhost:3000/api`);
  console.log(`📄 Swagger disponível em: http://localhost:3000/api/docs`);
}
bootstrap();
