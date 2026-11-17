import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmokeSensorsService } from './smoke-sensors.service.js';
import { SmokeSensorsController } from './smoke-sensors.controller.js';
import { SmokeSensor } from './entities/smoke-sensor.entity.js';

@Module({
  // Репозиторій для таблиці "smoke-sensors".
  imports: [TypeOrmModule.forFeature([SmokeSensor])],
  controllers: [SmokeSensorsController],
  providers: [SmokeSensorsService],
})
export class SmokeSensorsModule {}
