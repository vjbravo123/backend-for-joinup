import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT || 5000;

  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
}
bootstrap();