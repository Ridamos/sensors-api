import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureSensorsService } from './temperature-sensors.service.js';
import { TemperatureSensorsController } from './temperature-sensors.controller.js';
import { TemperatureSensor } from './entities/temperature-sensor.entity.js';
import { TemperatureAlertsService } from './temperature-alerts.service.js';

@Module({
  // forFeature створює репозиторій для сутності — об'єкт, через який
  // сервіс читає і записує рядки таблиці "temperature-sensors".
  imports: [TypeOrmModule.forFeature([TemperatureSensor])],
  controllers: [TemperatureSensorsController],
  // Лаб. №6: TemperatureAlertsService додано до providers. NestJS створює
  // один його екземпляр і передає той самий об'єкт і сервісу давачів,
  // і контролеру — тому вони працюють з одним потоком подій.
  providers: [TemperatureSensorsService, TemperatureAlertsService],
})
export class TemperatureSensorsModule {}
