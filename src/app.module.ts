import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TemperatureSensorsModule } from './temperature-sensors/temperature-sensors.module.js';
import { SmokeSensorsModule } from './smoke-sensors/smoke-sensors.module.js';

@Module({
  imports: [TemperatureSensorsModule, SmokeSensorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
