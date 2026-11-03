import { Module } from '@nestjs/common';
import { SmokeSensorsService } from './smoke-sensors.service.js';
import { SmokeSensorsController } from './smoke-sensors.controller.js';

@Module({
  controllers: [SmokeSensorsController],
  providers: [SmokeSensorsService],
})
export class SmokeSensorsModule {}
