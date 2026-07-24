import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function readAllowedOrigins() {
  const origins = process.env.FRONTEND_URL?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins && origins.length > 0 ? origins : true;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: readAllowedOrigins(),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
