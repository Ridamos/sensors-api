import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TemperatureSensorsModule } from './temperature-sensors/temperature-sensors.module.js';
import { TemperatureSensor } from './temperature-sensors/entities/temperature-sensor.entity.js';
import { SmokeSensorsModule } from './smoke-sensors/smoke-sensors.module.js';
import { SmokeSensor } from './smoke-sensors/entities/smoke-sensor.entity.js';
import { CreateSensorTables1791676800000 } from './migrations/1791676800000-CreateSensorTables.js';

// Без цих змінних підключитися до бази неможливо.
// Локально вони лежать у файлі .env, на Render — у розділі Environment веб-сервісу.
const REQUIRED = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];

@Module({
  imports: [
    // Читає файл .env і робить значення доступними через ConfigService.
    ConfigModule.forRoot({ isGlobal: true }),
    // Лаб. №5: підключення до PostgreSQL на Render через TypeORM.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const missing = REQUIRED.filter(
          (key) => !configService.get<string>(key),
        );
        if (missing.length > 0) {
          throw new Error(
            `Database settings are missing: ${missing.join(', ')}. ` +
              'Locally: create the .env file (see .env.example). ' +
              'On Render: add them in the Environment section of the web service.',
          );
        }
        const host = configService.get<string>('DB_HOST', '');
        if (/[:/@]/.test(host)) {
          throw new Error(
            'DB_HOST must contain only the host name, for example ' +
              'dpg-xxxxxxxx-a.frankfurt-postgres.render.com — not the whole postgresql://… URL.',
          );
        }
        return {
          type: 'postgres' as const,
          host,
          // Значення з .env завжди рядок, тому перетворюємо на число.
          port: Number(configService.get<string>('DB_PORT', '5432')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [TemperatureSensor, SmokeSensor],
          // false: TypeORM сам НЕ змінює таблиці під час запуску.
          // Схему бази змінюють лише міграції (папка src/migrations).
          synchronize: false,
          migrations: [CreateSensorTables1791676800000],
          // Під час старту виконати міграції, яких у цій базі ще не було.
          migrationsRun: true,
          // UUID генерує вбудована в PostgreSQL 13+ функція gen_random_uuid(),
          // тому встановлювати розширення в базу не потрібно.
          uuidExtension: 'pgcrypto' as const,
          installExtensions: false,
          // Render приймає зовнішні підключення лише із шифруванням.
          // DB_SSL=false потрібен тільки для локального PostgreSQL без SSL.
          ssl:
            configService.get<string>('DB_SSL') === 'false'
              ? false
              : { rejectUnauthorized: false },
        };
      },
    }),
    TemperatureSensorsModule,
    SmokeSensorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
