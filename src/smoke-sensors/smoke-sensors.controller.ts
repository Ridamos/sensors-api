import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Sse,
  type MessageEvent,
} from '@nestjs/common';
import { Observable, map, merge } from 'rxjs';
import { SmokeSensorsService } from './smoke-sensors.service.js';
import { CreateSmokeSensorDto } from './dto/create-smoke-sensor.dto.js';
import { UpdateSmokeSensorDto } from './dto/update-smoke-sensor.dto.js';
import { SmokeAlertsService } from './smoke-alerts.service.js';
import { keepAlive } from '../common/sse-keep-alive.js';

@Controller('smoke-sensors')
export class SmokeSensorsController {
  constructor(
    private readonly smokeSensorsService: SmokeSensorsService,
    private readonly alertsService: SmokeAlertsService,
  ) {}

  @Post()
  create(@Body() dto: CreateSmokeSensorDto) {
    return this.smokeSensorsService.create(dto);
  }

  @Get()
  findAll() {
    return this.smokeSensorsService.findAll();
  }

  // ВАЖЛИВО: оголошено ДО ':id', інакше 'alarms' сприйметься як id
  @Get('alarms')
  findAlarms() {
    return this.smokeSensorsService.findAlarms();
  }

  // Лаб. №6: SSE-ендпоінт GET /smoke-sensors/alerts — потік сповіщень
  // про задимлення в реальному часі. Не плутати з /alarms вище: той один раз
  // повертає з бази вже записані тривожні показання, а цей лишається
  // відкритим і надсилає нові, щойно вони з'являються.
  @Sse('alerts')
  alerts(): Observable<MessageEvent> {
    return merge(
      this.alertsService
        .getAlertStream()
        .pipe(map((alert) => ({ data: alert }))),
      keepAlive(),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.smokeSensorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSmokeSensorDto,
  ) {
    return this.smokeSensorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.smokeSensorsService.remove(id);
  }
}
