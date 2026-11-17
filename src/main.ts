import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Без цього рядка декоратори class-validator у DTO НЕ працюють
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // відкидає поля, яких немає в DTO
      forbidNonWhitelisted: true, // і повертає 400, якщо такі поля передали
      transform: true, // вмикає @Type(() => Number)
    }),
  );
  // Лаб. №3: CORS — дозвіл браузеру звертатися до API з іншого домену.
  // FRONTEND_URL не задано → '*' (дозволено всім, прийнятно для навчального проєкту).
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  // Render сам задає змінну PORT (10000); локально сервер слухає 3000.
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
await bootstrap();
