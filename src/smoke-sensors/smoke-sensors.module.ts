import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmokeSensorsService } from './smoke-sensors.service.js';
import { SmokeSensorsController } from './smoke-sensors.controller.js';
import { SmokeSensor } from './entities/smoke-sensor.entity.js';
import { SmokeAlertsService } from './smoke-alerts.service.js';

@Module({
  // Репозиторій для таблиці "smoke-sensors".
  imports: [TypeOrmModule.forFeature([SmokeSensor])],
  controllers: [SmokeSensorsController],
  // Лаб. №6: сервіс сповіщень про задимлення — один екземпляр на весь застосунок.
  providers: [SmokeSensorsService, SmokeAlertsService],
})
export class SmokeSensorsModule {}
